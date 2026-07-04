import React, { useEffect } from 'react';
import { View, Text, Pressable, TouchableOpacity, StyleSheet, ScrollView, Image, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CheckCircle2,
  MapPin,
  Package,
  ChevronRight,
  ShoppingBag,
  Clock,
} from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const PAYMENT_LOGOS: Record<string, ImageSourcePropType> = {
  'GCash': require('@/assets/images/payment/GCash_Logo.png'),
  'Maya':  require('@/assets/images/payment/maya.jpg'),
  'QR Ph': require('@/assets/images/payment/QRPH.png'),
};

export default function CheckoutSuccess() {
  const params = useLocalSearchParams<{
    item?: string;
    total?: string;
    orderNum?: string;
    payment?: string;
  }>();

  const item = params.item ?? "It's Showtime Jacket";
  const total = params.total ?? '12,150';
  const orderNum = params.orderNum ?? `LV-${Date.now().toString().slice(-8)}`;
  const payment = params.payment ?? 'Cash on Delivery';

  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.6);
  const ringOpacity = useSharedValue(0);

  useEffect(() => {
    checkOpacity.value = withTiming(1, { duration: 250 });
    checkScale.value = withDelay(80, withSpring(1.0, { damping: 18, stiffness: 170 }));
    ringOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    ringScale.value = withDelay(200, withSpring(1.0, { damping: 22, stiffness: 120 }));
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }));

  const isCOD = payment === 'Cash on Delivery';

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F3F7' }}>
      {/* Hero header */}
      <LinearGradient
        colors={['#4289AB', '#2C6F91', '#1A5070']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.hero}>
        <SafeAreaView edges={['top']} style={s.heroInner}>
          {/* Animated ring + check */}
          <View style={s.iconWrap}>
            <Animated.View style={[s.ring, ringStyle]} />
            <Animated.View style={[s.checkWrap, checkStyle]}>
              <CheckCircle2 size={72} color="#fff" strokeWidth={1.5} />
            </Animated.View>
          </View>

          <Animated.Text entering={FadeInUp.delay(300).duration(500)} style={s.heroTitle}>
            Order Placed!
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(430).duration(500)} style={s.heroSub}>
            {isCOD
              ? 'Your order is confirmed. Pay when it arrives.'
              : `Payment via ${payment} confirmed.`}
          </Animated.Text>

          {/* Order number badge */}
          <Animated.View entering={FadeIn.delay(550).duration(500)} style={s.orderBadge}>
            <Text style={s.orderBadgeLabel}>Order #</Text>
            <Text style={s.orderBadgeNum}>{orderNum}</Text>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>

        {/* Payment + item card */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={s.card}>
          <View style={s.cardRow}>
            <Text style={s.cardLabel}>Item</Text>
            <Text style={s.cardValue} numberOfLines={1}>{item}</Text>
          </View>
          <View style={s.cardRow}>
            <Text style={s.cardLabel}>Amount Paid</Text>
            <Text style={[s.cardValue, { color: '#4289AB', fontFamily: 'Poppins_700Bold' }]}>
              ₱{total}
            </Text>
          </View>
          <View style={[s.cardRow, { marginBottom: 0 }]}>
            <Text style={s.cardLabel}>Payment</Text>
            <View style={s.paymentBadge}>
              {PAYMENT_LOGOS[payment] ? (
                <Image
                  source={PAYMENT_LOGOS[payment]}
                  style={s.paymentLogo}
                  resizeMode="contain"
                />
              ) : (
                <Text style={s.paymentIcon}>💵</Text>
              )}
              <Text style={s.paymentBadgeLabel}>{payment}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Delivery info */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={s.card}>
          <View style={s.cardTitleRow}>
            <MapPin size={14} color="#4289AB" />
            <Text style={s.cardTitle}>Delivery Address</Text>
          </View>
          <Text style={s.addressLine}>Ian Vergara</Text>
          <Text style={s.addressSub}>123 Roxas Boulevard, Malate, Manila, 1004 Metro Manila</Text>
          <View style={s.divider} />
          <View style={s.deliveryRow}>
            <Clock size={13} color="#9CA3AF" />
            <Text style={s.deliveryText}>Estimated delivery: </Text>
            <Text style={s.deliveryBold}>3–5 business days</Text>
          </View>
        </Animated.View>

        {/* COD reminder */}
        {isCOD && (
          <Animated.View entering={FadeInDown.delay(460).duration(400)} style={s.codCard}>
            <Text style={s.codIcon}>💵</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.codTitle}>Cash on Delivery Reminder</Text>
              <Text style={s.codBody}>
                Please prepare the exact amount of ₱{total} when the rider arrives.
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Status tracker */}
        <Animated.View entering={FadeInDown.delay(520).duration(400)} style={s.card}>
          <View style={s.cardTitleRow}>
            <Package size={14} color="#4289AB" />
            <Text style={s.cardTitle}>Order Status</Text>
          </View>
          <View style={{ marginTop: 12, gap: 0 }}>
            {[
              { label: 'Order Placed', sub: 'Just now', done: true },
              { label: 'Processing', sub: 'Within 24 hours', done: false },
              { label: 'Shipped', sub: 'Expected in 1–2 days', done: false },
              { label: 'Delivered', sub: 'Expected in 3–5 days', done: false },
            ].map((step, i, arr) => (
              <View key={step.label} style={{ flexDirection: 'row', gap: 14 }}>
                <View style={{ alignItems: 'center', width: 22 }}>
                  <View style={[s.stepDot, step.done && s.stepDotDone]}>
                    {step.done && <View style={s.stepDotInner} />}
                  </View>
                  {i < arr.length - 1 && (
                    <View style={[s.stepLine, step.done && s.stepLineDone]} />
                  )}
                </View>
                <View style={{ paddingBottom: i < arr.length - 1 ? 22 : 0 }}>
                  <Text style={[s.stepLabel, step.done && { color: '#4289AB' }]}>
                    {step.label}
                  </Text>
                  <Text style={s.stepSub}>{step.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* CTAs */}
      <Animated.View entering={FadeInUp.delay(600).duration(400)} style={s.bottomBar}>
        <Pressable
          onPress={() => router.replace('/(tabs)/(order)' as any)}
          style={({ pressed }) => [s.trackBtn, pressed && { opacity: 0.87 }]}>
          <LinearGradient
            colors={['#4289AB', '#2C6F91']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.trackGrad}>
            <Text style={s.trackText}>Track My Order</Text>
            <ChevronRight size={16} color="#fff" />
          </LinearGradient>
        </Pressable>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.replace('/(tabs)/(store)' as any)}
          style={s.continueBtn}>
          <ShoppingBag size={16} color="#4289AB" />
          <Text style={s.continueText}>Continue Shopping</Text>
        </TouchableOpacity>
        <SafeAreaView edges={['bottom']} />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  hero: {
    paddingBottom: 24,
  },
  heroInner: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  iconWrap: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ring: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  checkWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: '#fff',
    marginBottom: 6,
  },
  heroSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 16,
  },
  orderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  orderBadgeLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  orderBadgeNum: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#fff',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
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
    fontSize: 13,
    color: '#1A2C3D',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  cardValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1A2C3D',
    maxWidth: '55%',
    textAlign: 'right',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EDF4F8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  paymentLogo: {
    width: 36,
    height: 20,
  },
  paymentIcon: {
    fontSize: 14,
  },
  paymentBadgeLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#4289AB',
  },
  addressLine: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1A2C3D',
  },
  addressSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F4F8',
    marginVertical: 12,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deliveryText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  deliveryBold: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1A2C3D',
  },
  codCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFBEB',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  codIcon: {
    fontSize: 22,
    marginTop: 1,
  },
  codTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#92400E',
    marginBottom: 3,
  },
  codBody: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#B45309',
    lineHeight: 18,
  },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: '#4289AB',
    borderColor: '#4289AB',
  },
  stepDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 2,
  },
  stepLineDone: {
    backgroundColor: '#4289AB',
  },
  stepLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#6B7280',
  },
  stepSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  bottomBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8EFF4',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 10,
  },
  trackBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  trackGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  trackText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#fff',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#4289AB',
    backgroundColor: '#fff',
  },
  continueText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#4289AB',
  },
});
