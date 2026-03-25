import { useState } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Package, Tag, ChevronRight, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CheckoutHeader from '@/features/checkout/CheckoutHeader';
import PaymentOption from '@/features/checkout/PaymentOption';

const VOUCHERS: Record<string, { label: string; discount: number; type: 'percent' | 'fixed' | 'shipping' }> = {
  'WELCOME50': { label: 'Welcome Gift — 50% off', discount: 50, type: 'percent' },
  'FIRSTBUY':  { label: 'First Order — ₱200 off', discount: 200, type: 'fixed' },
  'FREESHIP':  { label: 'Free Shipping',           discount: 150, type: 'shipping' },
  'LUVLOTS10': { label: '10% Sitewide Discount',   discount: 10,  type: 'percent' },
  'BIDWIN20':  { label: 'Auction Winner — 20% off', discount: 20, type: 'percent' },
};

const MOCK_ORDER = {
  item: "It's Showtime Jacket",
  seller: 'Vice Ganda',
  price: 12000,
  shipping: 150,
  imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&q=80',
};

export default function CheckoutIndex() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);

  function handleApplyVoucher() {
    const options = Object.keys(VOUCHERS).map((code) => ({
      text: `${code} — ${VOUCHERS[code].label}`,
      onPress: () => {
        setAppliedVoucher(code);
      },
    }));
    Alert.alert(
      'Select Voucher',
      'Choose a voucher to apply to your order:',
      [...options, { text: 'View All Vouchers', onPress: () => router.push('/(main)/VouchersScreen' as any) }, { text: 'Cancel', style: 'cancel' as const }]
    );
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

  function handleConfirm() {
    if (!selected) {
      Alert.alert('Select Payment Method', 'Please choose a payment method to continue.');
      return;
    }
    router.replace({
      pathname: '/checkout/success',
      params: {
        item: MOCK_ORDER.item,
        total: total.toLocaleString(),
      },
    } as any);
  }

  const discount = getDiscount();
  const shipping = appliedVoucher && VOUCHERS[appliedVoucher]?.type === 'shipping' ? 0 : MOCK_ORDER.shipping;
  const total = MOCK_ORDER.price + shipping - (VOUCHERS[appliedVoucher ?? '']?.type !== 'shipping' ? discount : 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 38 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}>

        <CheckoutHeader step={1} title="" />

        {/* Order summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.orderRow}>
            <Image source={{ uri: MOCK_ORDER.imageUri }} style={styles.orderImage} resizeMode="cover" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.orderName} numberOfLines={2}>{MOCK_ORDER.item}</Text>
              <Text style={styles.orderSeller}>{MOCK_ORDER.seller}</Text>
              <Text style={styles.orderPrice}>₱{MOCK_ORDER.price.toLocaleString()}.00</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>₱{MOCK_ORDER.price.toLocaleString()}.00</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text style={[styles.totalValue, shipping === 0 && { color: '#10B981' }]}>
              {shipping === 0 ? 'FREE' : `₱${MOCK_ORDER.shipping.toLocaleString()}.00`}
            </Text>
          </View>
          {discount > 0 && VOUCHERS[appliedVoucher ?? '']?.type !== 'shipping' && (
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: '#10B981' }]}>Voucher Discount</Text>
              <Text style={[styles.totalValue, { color: '#10B981' }]}>−₱{discount.toLocaleString()}.00</Text>
            </View>
          )}
          <View style={[styles.totalRow, { marginTop: 8 }]}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>₱{total.toLocaleString()}.00</Text>
          </View>
        </View>

        {/* Delivery address */}
        <Pressable
          style={styles.card}
          onPress={() => router.push('/(profile)/Addresses' as any)}>
          <View style={styles.cardTitleRow}>
            <MapPin size={15} color="#4289AB" />
            <Text style={styles.cardTitle}>Delivery Address</Text>
          </View>
          <Text style={styles.addressLine}>123 Roxas Boulevard, Malate</Text>
          <Text style={styles.addressSub}>Manila, 1004 Metro Manila</Text>
          <Text style={styles.changeLink}>Change address →</Text>
        </Pressable>

        {/* Voucher */}
        <Pressable
          onPress={appliedVoucher ? () => setAppliedVoucher(null) : handleApplyVoucher}
          style={styles.voucherCard}>
          <Tag size={16} color={appliedVoucher ? '#10B981' : '#D9AC4E'} />
          {appliedVoucher ? (
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.voucherLabel, { color: '#10B981' }]}>Voucher Applied</Text>
              <Text style={styles.voucherCode}>{VOUCHERS[appliedVoucher]?.label}</Text>
            </View>
          ) : (
            <Text style={[styles.voucherLabel, { marginLeft: 10 }]}>Apply Voucher / Promo Code</Text>
          )}
          {appliedVoucher ? (
            <X size={16} color="#9CA3AF" />
          ) : (
            <ChevronRight size={16} color="#CCC" />
          )}
        </Pressable>

        {/* Payment method */}
        <View style={[styles.card, { paddingBottom: 4 }]}>
          <View style={styles.cardTitleRow}>
            <Package size={15} color="#4289AB" />
            <Text style={styles.cardTitle}>Payment Method</Text>
          </View>
        </View>

        <PaymentOption
          title="Cash On Delivery"
          subtitle="Pay when your item arrives"
          icon="truck"
          selected={selected === 'cod'}
          onPress={() => setSelected(selected === 'cod' ? null : 'cod')}
          expanded={selected === 'cod'}
          nestedOptions={
            selected === 'cod'
              ? [{ id: 'addr', title: '123 Roxas Blvd, Malate, Manila', subtitle: 'Delivery location' }]
              : undefined
          }
        />
        <PaymentOption
          title="Credit / Debit Card"
          subtitle="Visa, Mastercard, Amex"
          icon="credit-card"
          selected={selected === 'card'}
          onPress={() => setSelected(selected === 'card' ? null : 'card')}
          expanded={selected === 'card'}
          nestedOptions={
            selected === 'card'
              ? [
                  { id: 'visa', title: 'Visa •••• 4242' },
                  { id: 'mc', title: 'Mastercard •••• 5353' },
                ]
              : undefined
          }
        />
        <PaymentOption
          title="Online Payment"
          subtitle="GCash, Maya"
          icon="globe"
          selected={selected === 'online'}
          onPress={() => setSelected(selected === 'online' ? null : 'online')}
          expanded={selected === 'online'}
          nestedOptions={
            selected === 'online'
              ? [{ id: 'gcash', title: 'GCash' }, { id: 'maya', title: 'Maya' }]
              : undefined
          }
        />
        <PaymentOption
          title="International Payment"
          subtitle="Stripe, PayPal, PayMongo"
          icon="world"
          selected={selected === 'intl'}
          onPress={() => setSelected(selected === 'intl' ? null : 'intl')}
          expanded={selected === 'intl'}
          nestedOptions={
            selected === 'intl'
              ? [
                  { id: 'stripe', title: 'Stripe' },
                  { id: 'paypal', title: 'PayPal' },
                  { id: 'paymongo', title: 'PayMongo' },
                ]
              : undefined
          }
        />
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bottomLabel}>Total</Text>
          <Text style={styles.bottomTotal}>₱{total.toLocaleString()}.00</Text>
        </View>
        <Pressable
          onPress={handleConfirm}
          style={({ pressed }) => [styles.confirmBtn, pressed && { opacity: 0.88 }]}>
          <LinearGradient
            colors={['#4289AB', '#2C6F91']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmGradient}>
            <Text style={styles.confirmText}>Confirm Payment</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#1A2C3D',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  orderImage: {
    width: 66,
    height: 66,
    borderRadius: 10,
    backgroundColor: '#EEF3F7',
  },
  orderName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1A2C3D',
    lineHeight: 18,
  },
  orderSeller: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#4289AB',
    marginTop: 2,
  },
  orderPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#1A2C3D',
    marginTop: 4,
  },
  divider: { height: 1, backgroundColor: '#F0F4F8', marginVertical: 12 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6B7280' },
  totalValue: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#333' },
  grandLabel: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#1A2C3D' },
  grandValue: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#4289AB' },
  voucherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  voucherLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1A2C3D',
  },
  voucherCode: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#10B981',
    marginTop: 2,
  },
  addressLine: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1A2C3D' },
  addressSub: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280', marginTop: 2 },
  changeLink: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#4289AB', marginTop: 8 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8EFF4',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 10,
    gap: 14,
  },
  bottomLabel: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF' },
  bottomTotal: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#1A2C3D' },
  confirmBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  confirmGradient: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  confirmText: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#fff', textAlign: 'center' },
});
