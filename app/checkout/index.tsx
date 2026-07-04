import { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  MapPin,
  Tag,
  ChevronRight,
  X,
  Truck,
  Wallet,
  Check,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import GCashPaymentModal from '@/components/GCashPaymentModal';
import { useAuth } from '@/lib/auth-context';
import { env } from '@/lib/env';

const VOUCHERS: Record<string, { label: string; discount: number; type: 'percent' | 'fixed' | 'shipping' }> = {
  'WELCOME50': { label: 'Welcome Gift — 50% off', discount: 50, type: 'percent' },
  'FIRSTBUY':  { label: 'First Order — ₱200 off', discount: 200, type: 'fixed' },
  'FREESHIP':  { label: 'Free Shipping',           discount: 150, type: 'shipping' },
  'LUVLOTS10': { label: '10% Sitewide Discount',   discount: 10,  type: 'percent' },
  'BIDWIN20':  { label: 'Auction Winner — 20% off', discount: 20, type: 'percent' },
};

const MOCK_ORDER = {
  item: "It's Showtime Jacket",
  seller: 'Vice Ganda Shop',
  price: 12000,
  shipping: 150,
  qty: 1,
  imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&q=80',
  // G8 Pay charges are derived server-side from a real `listings` row (see
  // supabase/functions/g8-pay-create-checkout), never from client input.
  // This screen still runs on mock cart data, so there's no real listing
  // behind it yet -- set this to a real listings.id (see README "Known
  // limitations") to test the live GCash flow end-to-end.
  listingId: '',
};

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
  const [paymentGroup, setPaymentGroup] = useState<'ewallet' | 'cod' | null>(null);
  const [walletChoice, setWalletChoice] = useState<PaymentId | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [showGCashModal, setShowGCashModal] = useState(false);

  function handleApplyVoucher() {
    const options = Object.keys(VOUCHERS).map((code) => ({
      text: `${code} — ${VOUCHERS[code].label}`,
      onPress: () => setAppliedVoucher(code),
    }));
    Alert.alert('Select Voucher', 'Choose a voucher to apply:', [
      ...options,
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  }

  function getDiscount() {
    if (!appliedVoucher) return 0;
    const v = VOUCHERS[appliedVoucher];
    if (!v) return 0;
    if (v.type === 'percent') return Math.round(MOCK_ORDER.price * v.discount / 100);
    if (v.type === 'fixed') return v.discount;
    if (v.type === 'shipping') return MOCK_ORDER.shipping;
    return 0;
  }

  const discount = getDiscount();
  const shippingFee =
    appliedVoucher && VOUCHERS[appliedVoucher]?.type === 'shipping' ? 0 : MOCK_ORDER.shipping;
  const subtotalDiscount = VOUCHERS[appliedVoucher ?? '']?.type !== 'shipping' ? discount : 0;
  const total = MOCK_ORDER.price + shippingFee - subtotalDiscount;

  function getPaymentLabel() {
    if (paymentGroup === 'cod') return 'Cash on Delivery';
    if (paymentGroup === 'ewallet' && walletChoice === 'gcash') return 'GCash';
    if (paymentGroup === 'ewallet' && walletChoice === 'maya') return 'Maya';
    if (paymentGroup === 'ewallet' && walletChoice === 'qrph') return 'QR Ph';
    return null;
  }

  function goToSuccessScreen(label: string) {
    router.replace({
      pathname: '/checkout/success',
      params: {
        item: MOCK_ORDER.item,
        total: total.toLocaleString(),
        payment: label,
      },
    } as any);
  }

  function handlePlaceOrder() {
    const label = getPaymentLabel();
    if (!label) {
      Alert.alert('Select Payment', 'Please choose a payment method to continue.');
      return;
    }

    if (paymentGroup === 'ewallet' && walletChoice === 'gcash') {
      if (!env.enableG8Pay) {
        Alert.alert(
          'G8 Pay not enabled',
          'Set EXPO_PUBLIC_ENABLE_G8_PAY=true in .env once the G8 Pay Edge Functions are deployed.',
        );
        return;
      }
      if (!user) {
        Alert.alert('Sign in required', 'Please sign in to pay with GCash.');
        return;
      }
      setShowGCashModal(true);
      return;
    }

    // Cash on Delivery / Maya / QR Ph still use the mock flow -- only the
    // GCash path above is wired to the real G8 Pay integration.
    goToSuccessScreen(label);
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
          <Text style={s.addressName}>Ian Vergara  <Text style={s.addressPhone}>+63 912 345 6789</Text></Text>
          <Text style={s.addressLine}>123 Roxas Boulevard, Malate, Manila, 1004 Metro Manila</Text>
          <View style={s.changeRow}>
            <Text style={s.changeLink}>Change</Text>
            <ChevronRight size={13} color="#4289AB" />
          </View>
        </Pressable>

        <View style={s.sep} />

        {/* Items section */}
        <View style={s.section}>
          <Text style={s.sellerRow}>
            <Text style={s.sellerIcon}>🏪 </Text>
            <Text style={s.sellerName}>{MOCK_ORDER.seller}</Text>
          </Text>
          <View style={s.itemRow}>
            <Image
              source={{ uri: MOCK_ORDER.imageUri }}
              style={s.itemImage}
              resizeMode="cover"
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.itemName} numberOfLines={2}>{MOCK_ORDER.item}</Text>
              <Text style={s.itemVariant}>Size: M  ·  Color: Black</Text>
              <View style={s.itemBottomRow}>
                <Text style={s.itemPrice}>₱{MOCK_ORDER.price.toLocaleString()}.00</Text>
                <Text style={s.itemQty}>x{MOCK_ORDER.qty}</Text>
              </View>
            </View>
          </View>

          {/* Shipping method */}
          <View style={s.shippingRow}>
            <Truck size={13} color="#9CA3AF" />
            <Text style={s.shippingLabel}>Standard Delivery</Text>
            <Text style={s.shippingFee}>
              {shippingFee === 0 ? 'FREE' : `₱${MOCK_ORDER.shipping}.00`}
            </Text>
          </View>
        </View>

        <View style={s.sep} />

        {/* Voucher */}
        <Pressable
          style={s.section}
          onPress={appliedVoucher ? () => setAppliedVoucher(null) : handleApplyVoucher}>
          <View style={s.voucherRow}>
            <Tag size={15} color={appliedVoucher ? '#10B981' : '#D9AC4E'} />
            {appliedVoucher ? (
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={s.voucherApplied}>Voucher Applied</Text>
                <Text style={s.voucherCode}>{VOUCHERS[appliedVoucher]?.label}</Text>
              </View>
            ) : (
              <Text style={[s.voucherPlaceholder, { marginLeft: 10 }]}>
                LuvLots Voucher / Promo Code
              </Text>
            )}
            {appliedVoucher ? (
              <X size={16} color="#9CA3AF" />
            ) : (
              <ChevronRight size={15} color="#CCC" />
            )}
          </View>
        </Pressable>

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

                {/* E-wallet sub-options */}
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
            <Text style={s.summaryLabel}>Subtotal ({MOCK_ORDER.qty} item)</Text>
            <Text style={s.summaryValue}>₱{MOCK_ORDER.price.toLocaleString()}.00</Text>
          </View>
          <View style={s.summaryRow}>
            <Text style={s.summaryLabel}>Shipping Fee</Text>
            <Text style={[s.summaryValue, shippingFee === 0 && { color: '#10B981' }]}>
              {shippingFee === 0 ? 'FREE' : `₱${MOCK_ORDER.shipping.toLocaleString()}.00`}
            </Text>
          </View>
          {subtotalDiscount > 0 && (
            <View style={s.summaryRow}>
              <Text style={[s.summaryLabel, { color: '#10B981' }]}>Voucher Discount</Text>
              <Text style={[s.summaryValue, { color: '#10B981' }]}>−₱{subtotalDiscount.toLocaleString()}.00</Text>
            </View>
          )}
          <View style={s.totalDivider} />
          <View style={s.summaryRow}>
            <Text style={s.totalLabel}>Total Payment</Text>
            <Text style={s.totalValue}>₱{total.toLocaleString()}.00</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={s.bottomBar}>
        <SafeAreaView edges={['bottom']}>
          <View style={s.bottomInner}>
            <View style={{ flex: 1 }}>
              <Text style={s.bottomLabel}>Total Payment</Text>
              <Text style={s.bottomTotal}>₱{total.toLocaleString()}.00</Text>
            </View>
            <Pressable
              onPress={handlePlaceOrder}
              style={({ pressed }) => [s.placeBtn, pressed && { opacity: 0.88 }]}>
              <LinearGradient
                colors={['#4289AB', '#2C6F91']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.placeGrad}>
                <Text style={s.placeText}>Place Order</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      <GCashPaymentModal
        visible={showGCashModal}
        listingId={MOCK_ORDER.listingId}
        amount={total}
        onClose={() => setShowGCashModal(false)}
        onPaid={() => {
          setShowGCashModal(false);
          goToSuccessScreen('GCash');
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
  addressName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#1A2C3D',
    marginBottom: 3,
  },
  addressPhone: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#6B7280',
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
  sellerRow: {
    marginBottom: 10,
  },
  sellerIcon: {
    fontSize: 13,
  },
  sellerName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#1A2C3D',
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
    color: '#EF4444',
  },
  itemQty: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  shippingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F3F7',
  },
  shippingLabel: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  shippingFee: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#10B981',
  },
  voucherRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voucherApplied: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#10B981',
  },
  voucherCode: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#10B981',
    marginTop: 1,
  },
  voucherPlaceholder: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
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
    color: '#EF4444',
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
    color: '#EF4444',
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
