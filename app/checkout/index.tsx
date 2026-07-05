import { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  ImageSourcePropType,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  MapPin,
  ChevronRight,
  Truck,
  Wallet,
  Check,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import GCashPaymentModal from '@/components/GCashPaymentModal';
import { getMyAddresses } from '@/lib/addresses';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { env } from '@/lib/env';
import { getListingsByIds, type LiveListing } from '@/lib/listings';
import { createOrderFromListings } from '@/lib/orders';
import { logError } from '@/lib/observability';
import type { Address } from '@/types/marketplace';

type PaymentId = 'cod' | 'gcash' | 'maya' | 'qrph';

const WALLET_LOGOS: Record<string, ImageSourcePropType> = {
  gcash: require('@/assets/images/payment/GCash_Logo.png'),
  maya:  require('@/assets/images/payment/maya.jpg'),
  qrph:  require('@/assets/images/payment/QRPH.png'),
};

const PAYMENT_OPTIONS = [
  {
    id: 'ewallet' as const,
    label: 'E-Wallet',
    sub: 'GCash · Maya · QR Ph',
    icon: Wallet,
    children: [
      { id: 'gcash' as PaymentId, label: 'GCash' },
      { id: 'maya' as PaymentId, label: 'Maya' },
      { id: 'qrph' as PaymentId, label: 'QR Ph' },
    ],
  },
  {
    id: 'cod' as const,
    label: 'Cash on Delivery',
    sub: 'Pay when your order arrives',
    icon: Truck,
    children: null,
  },
];

export default function CheckoutIndex() {
  const router = useRouter();
  const { user } = useAuth();
  const { listingIds: listingIdsParam } = useLocalSearchParams<{ listingIds?: string }>();
  const { clearCart } = useCart();

  const [items, setItems] = useState<LiveListing[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentGroup, setPaymentGroup] = useState<'ewallet' | 'cod' | null>(null);
  const [walletChoice, setWalletChoice] = useState<PaymentId | null>(null);
  const [showGCashModal, setShowGCashModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const listingIds = (listingIdsParam ?? '').split(',').filter(Boolean);

  useEffect(() => {
    if (listingIds.length === 0) {
      setLoading(false);
      return;
    }
    getListingsByIds(listingIds)
      .then(setItems)
      .catch((error) => logError(error, { area: 'Checkout.loadItems' }))
      .finally(() => setLoading(false));
    getMyAddresses()
      .then((addresses) => setDefaultAddress(addresses.find((a) => a.is_default) ?? addresses[0] ?? null))
      .catch((error) => logError(error, { area: 'Checkout.loadAddress' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingIdsParam]);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const QRPH_WALLETS: PaymentId[] = ['gcash', 'maya', 'qrph'];
  const QRPH_LABELS: Record<string, string> = { gcash: 'GCash', maya: 'Maya', qrph: 'QR Ph' };

  function getPaymentLabel() {
    if (paymentGroup === 'cod') return 'Cash on Delivery';
    if (paymentGroup === 'ewallet' && walletChoice && QRPH_WALLETS.includes(walletChoice)) {
      return QRPH_LABELS[walletChoice];
    }
    return null;
  }

  function goToSuccessScreen(label: string) {
    clearCart(listingIds);
    router.replace({
      pathname: '/checkout/success',
      params: {
        item: items.length === 1 ? items[0].title : `${items.length} items`,
        total: total.toLocaleString(),
        payment: label,
      },
    } as any);
  }

  async function handlePlaceOrder() {
    if (items.length === 0) return;

    const label = getPaymentLabel();
    if (!label) {
      Alert.alert('Select Payment', 'Please choose a payment method to continue.');
      return;
    }
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to check out.');
      return;
    }

    const isQrPhWallet = paymentGroup === 'ewallet' && walletChoice !== null && QRPH_WALLETS.includes(walletChoice);

    if (isQrPhWallet && !env.enableG8Pay) {
      Alert.alert(
        'G8 Pay not enabled',
        'Set EXPO_PUBLIC_ENABLE_G8_PAY=true in .env once the G8 Pay Edge Functions are deployed.',
      );
      return;
    }

    if (isQrPhWallet && total !== 0 && (total < 200 || total > 50000)) {
      Alert.alert(
        'Order total not supported',
        'G8 Pay can only process QR Ph payments between ₱200 and ₱50,000. Please choose Cash on Delivery for this order total.',
      );
      return;
    }

    setCreatingOrder(true);
    try {
      const { order } = await createOrderFromListings(items.map((item) => item.id));

      if (isQrPhWallet) {
        setPendingOrderId(order.id);
        setShowGCashModal(true);
        return;
      }

      // Cash on Delivery: the order itself is real; fulfillment/payment
      // collection happens offline between buyer and seller.
      goToSuccessScreen(label);
    } catch (error) {
      logError(error, { area: 'Checkout.handlePlaceOrder' });
      Alert.alert('Could not place order', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setCreatingOrder(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F0F3F7', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#4289AB" size="large" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F0F3F7', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#1A2C3D', textAlign: 'center' }}>
          No items to check out
        </Text>
        <Pressable onPress={() => router.replace('/(tabs)/(cart)')} style={[s.placeBtn, { marginTop: 20 }]}>
          <LinearGradient colors={['#4289AB', '#2C6F91']} style={s.placeGrad}>
            <Text style={s.placeText}>Back to Cart</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F3F7' }}>
      {/* Header */}
      <SafeAreaView style={{ backgroundColor: '#fff' }} edges={['top']}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <ChevronLeft size={22} color="#1A2C3D" />
          </Pressable>
          <Text style={s.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}>

        {/* Delivery address */}
        <Pressable
          style={s.section}
          onPress={() => router.push('/(profile)/Addresses' as any)}>
          <View style={s.sectionTitleRow}>
            <MapPin size={14} color="#4289AB" />
            <Text style={s.sectionTitle}>Delivery Address</Text>
          </View>
          {defaultAddress ? (
            <>
              <Text style={s.addressLine}>
                {defaultAddress.full_name} · {defaultAddress.phone}
              </Text>
              <Text style={s.addressLine}>
                {[defaultAddress.street, defaultAddress.city, defaultAddress.region, defaultAddress.postal_code]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </>
          ) : (
            <Text style={s.addressLine}>No delivery address saved yet.</Text>
          )}
          <View style={s.changeRow}>
            <Text style={s.changeLink}>{defaultAddress ? 'Change address' : 'Add address'}</Text>
            <ChevronRight size={13} color="#4289AB" />
          </View>
        </Pressable>

        <View style={s.sep} />

        {/* Items section */}
        <View style={s.section}>
          {items.map((item) => (
            <View key={item.id} style={s.itemRow}>
              <Image
                source={{ uri: item.cover_image_url ?? undefined }}
                style={s.itemImage}
                resizeMode="cover"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.itemName} numberOfLines={2}>{item.title}</Text>
                <Text style={s.itemVariant} numberOfLines={1}>
                  {item.seller?.full_name ?? item.seller?.username ?? 'LUVLOTS Seller'}
                </Text>
                <View style={s.itemBottomRow}>
                  <Text style={s.itemPrice}>{item.currency} {item.price.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={s.sep} />

        {/* Payment Method */}
        <View style={s.section}>
          <Text style={s.pmTitle}>Payment Method</Text>

          {PAYMENT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = paymentGroup === opt.id;
            return (
              <View key={opt.id}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={[s.pmRow, selected && s.pmRowActive]}
                  onPress={() => {
                    setPaymentGroup(selected ? null : opt.id);
                    if (opt.id !== 'ewallet') setWalletChoice(null);
                  }}>
                  <View style={[s.pmIconWrap, selected && s.pmIconWrapActive]}>
                    <Icon size={18} color={selected ? '#fff' : '#4289AB'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.pmLabel, selected && s.pmLabelActive]}>{opt.label}</Text>
                    <Text style={s.pmSub}>{opt.sub}</Text>
                  </View>
                  <View style={[s.radio, selected && s.radioSelected]}>
                    {selected && <View style={s.radioDot} />}
                  </View>
                </TouchableOpacity>

                {selected && opt.children && (
                  <View style={s.walletOptions}>
                    {opt.children.map((child) => {
                      const wSelected = walletChoice === child.id;
                      return (
                        <TouchableOpacity
                          key={child.id}
                          activeOpacity={0.75}
                          style={[s.walletRow, wSelected && s.walletRowActive]}
                          onPress={() => setWalletChoice(child.id)}>
                          <Image
                            source={WALLET_LOGOS[child.id]}
                            style={s.walletLogo}
                            resizeMode="contain"
                          />
                          <Text style={[s.walletLabel, wSelected && s.walletLabelActive]}>
                            {child.label}
                          </Text>
                          {wSelected && (
                            <View style={s.checkBadge}>
                              <Check size={11} color="#fff" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={s.sep} />

        {/* Order total summary */}
        <View style={s.section}>
          <Text style={s.pmTitle}>Order Summary</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Subtotal ({items.length} item{items.length === 1 ? '' : 's'})</Text>
            <Text style={s.summaryValue}>{items[0]?.currency ?? 'PHP'} {total.toLocaleString()}</Text>
          </View>
          <View style={s.totalDivider} />
          <View style={s.summaryRow}>
            <Text style={s.totalLabel}>Total Payment</Text>
            <Text style={s.totalValue}>{items[0]?.currency ?? 'PHP'} {total.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={s.bottomBar}>
        <SafeAreaView edges={['bottom']}>
          <View style={s.bottomInner}>
            <View style={{ flex: 1 }}>
              <Text style={s.bottomLabel}>Total Payment</Text>
              <Text style={s.bottomTotal}>{items[0]?.currency ?? 'PHP'} {total.toLocaleString()}</Text>
            </View>
            <Pressable
              onPress={handlePlaceOrder}
              disabled={creatingOrder}
              style={({ pressed }) => [s.placeBtn, (pressed || creatingOrder) && { opacity: 0.88 }]}>
              <LinearGradient
                colors={['#4289AB', '#2C6F91']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.placeGrad}>
                {creatingOrder ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.placeText}>Place Order</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      <GCashPaymentModal
        visible={showGCashModal}
        orderId={pendingOrderId ?? ''}
        amount={total}
        providerLabel={walletChoice ? QRPH_LABELS[walletChoice] : 'GCash'}
        onClose={() => setShowGCashModal(false)}
        onPaid={() => {
          setShowGCashModal(false);
          goToSuccessScreen(walletChoice ? QRPH_LABELS[walletChoice] : 'GCash');
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F7',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#1A2C3D',
    textAlign: 'center',
  },
  sep: {
    height: 8,
    backgroundColor: '#F0F3F7',
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#4289AB',
  },
  addressLine: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 2,
  },
  changeLink: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#4289AB',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#EEF3F7',
  },
  itemName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1A2C3D',
    lineHeight: 19,
  },
  itemVariant: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 3,
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  itemPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#1A2C3D',
  },
  pmTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#1A2C3D',
    marginBottom: 12,
  },
  pmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  pmRowActive: {
    borderColor: '#4289AB',
    backgroundColor: '#EDF4F8',
  },
  pmIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EDF4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pmIconWrapActive: {
    backgroundColor: '#4289AB',
  },
  pmLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#1A2C3D',
  },
  pmLabelActive: {
    color: '#4289AB',
  },
  pmSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#4289AB',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4289AB',
  },
  walletOptions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: -4,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  walletRow: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  walletRowActive: {
    borderColor: '#4289AB',
    backgroundColor: '#EDF4F8',
  },
  walletLogo: {
    width: 52,
    height: 28,
  },
  walletLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  walletLabelActive: {
    color: '#4289AB',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4289AB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  summaryLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  summaryValue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#333',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#F0F4F8',
    marginVertical: 10,
  },
  totalLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#1A2C3D',
  },
  totalValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#1A2C3D',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8EFF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 14,
  },
  bottomInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 14,
  },
  bottomLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
  },
  bottomTotal: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#1A2C3D',
  },
  placeBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  placeGrad: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  placeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#fff',
  },
});
