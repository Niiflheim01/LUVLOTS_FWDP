import React, { useEffect } from 'react';
import { View, Text, Pressable, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, MapPin, Package, ChevronRight, ShoppingBag } from 'lucide-react-native';
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

export default function CheckoutSuccess() {
  const params = useLocalSearchParams<{
    item?: string;
    total?: string;
    orderNum?: string;
  }>();

  const item = params.item ?? "It's Showtime Jacket";
  const total = params.total ?? '12,150';
  const orderNum = params.orderNum ?? `LV-${Date.now().toString().slice(-8)}`;

  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);

  useEffect(() => {
    checkOpacity.value = withTiming(1, { duration: 300 });
    checkScale.value = withDelay(80, withSpring(1.0, { damping: 20, stiffness: 160 }));
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <LinearGradient
        colors={['#4289AB', '#2C6F91']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}>
        <SafeAreaView edges={['top']} style={s.headerInner}>
          <Animated.View entering={FadeIn.delay(100).duration(500)} style={s.checkWrap}>
            <Animated.View style={checkStyle}>
              <CheckCircle2 size={68} color="#fff" strokeWidth={1.5} />
            </Animated.View>
          </Animated.View>
          <Animated.Text entering={FadeInUp.delay(300).duration(500)} style={s.successTitle}>
            Order Placed!
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(450).duration(500)} style={s.successSub}>
            Your order is confirmed and being processed.
          </Animated.Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>

        {/* Order number card */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={s.card}>
          <View style={s.orderNumRow}>
            <Text style={s.orderNumLabel}>Order Number</Text>
            <Text style={s.orderNumValue}>{orderNum}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Item</Text>
            <Text style={s.infoValue} numberOfLines={1}>{item}</Text>
          </View>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Total Paid</Text>
            <Text style={[s.infoValue, { color: '#4289AB', fontFamily: 'Poppins_700Bold' }]}>₱{total}</Text>
          </View>
          <View style={[s.infoRow, { marginBottom: 0 }]}>
            <Text style={s.infoLabel}>Payment</Text>
            <Text style={s.infoValue}>Cash On Delivery</Text>
          </View>
        </Animated.View>

        {/* Delivery info */}
        <Animated.View entering={FadeInDown.delay(420).duration(400)} style={s.card}>
          <View style={s.cardTitleRow}>
            <MapPin size={15} color="#4289AB" />
            <Text style={s.cardTitle}>Delivery Address</Text>
          </View>
          <Text style={s.addressLine}>123 Roxas Boulevard, Malate</Text>
          <Text style={s.addressSub}>Manila, 1004 Metro Manila</Text>
          <View style={s.divider} />
          <View style={s.deliveryRow}>
            <Package size={15} color="#9CA3AF" />
            <Text style={s.deliveryText}>Estimated delivery: </Text>
            <Text style={s.deliveryBold}>3–5 business days</Text>
          </View>
        </Animated.View>

        {/* Status tracker */}
        <Animated.View entering={FadeInDown.delay(540).duration(400)} style={s.card}>
          <Text style={s.cardTitle}>Order Status</Text>
          <View style={{ marginTop: 16, gap: 0 }}>
            {[
              { label: 'Order Placed', sub: 'Just now', done: true },
              { label: 'Processing', sub: 'Within 24 hours', done: false },
              { label: 'Shipped', sub: 'Expected in 1–2 days', done: false },
              { label: 'Delivered', sub: 'Expected in 3–5 days', done: false },
            ].map((step, i, arr) => (
              <View key={step.label} style={{ flexDirection: 'row', gap: 14 }}>
                <View style={{ alignItems: 'center', width: 20 }}>
                  <View style={[s.stepDot, step.done && s.stepDotDone]} />
                  {i < arr.length - 1 && <View style={[s.stepLine, step.done && s.stepLineDone]} />}
                </View>
                <View style={{ paddingBottom: i < arr.length - 1 ? 20 : 0 }}>
                  <Text style={[s.stepLabel, step.done && { color: '#4289AB' }]}>{step.label}</Text>
                  <Text style={s.stepSub}>{step.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom CTAs — NOT absolutely positioned, sits naturally at bottom */}
      <Animated.View entering={FadeInUp.delay(600).duration(400)} style={s.bottomBar}>
        <Pressable
          onPress={() => router.replace('/(tabs)/(order)' as any)}
          style={({ pressed }) => [s.trackBtn, pressed && { opacity: 0.85 }]}>
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
  header: {
    paddingBottom: 28,
  },
  headerInner: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  checkWrap: {
    marginBottom: 14,
  },
  successTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: '#fff',
    marginBottom: 6,
  },
  successSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
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
  orderNumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  orderNumValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#1A2C3D',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F4F8',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  infoValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1A2C3D',
    maxWidth: '60%',
    textAlign: 'right',
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
    marginTop: 2,
    marginBottom: 12,
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
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginTop: 2,
  },
  stepDotDone: {
    backgroundColor: '#4289AB',
    borderColor: '#4289AB',
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
