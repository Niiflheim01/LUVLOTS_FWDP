import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { ShoppingBag, TrendingUp, Users, CircleCheckBig, ChevronRight, Star } from 'lucide-react-native';

const { width: W } = Dimensions.get('window');

const FEATURES = [
  {
    icon: Users,
    color: '#6DB8D8',
    bg: 'rgba(109,184,216,0.15)',
    title: 'Reach Millions of Buyers',
    desc: 'Connect with buyers across the Philippines and beyond.',
  },
  {
    icon: ShoppingBag,
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.15)',
    title: 'Easy Product Listings',
    desc: 'Upload products and manage your inventory with ease.',
  },
  {
    icon: TrendingUp,
    color: '#34D399',
    bg: 'rgba(52,211,153,0.15)',
    title: 'Secure & Fast Payouts',
    desc: 'Secure payments with quick settlement to your account.',
  },
];

function GlowOrb({ delay, style }: { delay: number; style?: any }) {
  const opacity = useSharedValue(0.15);
  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(withTiming(0.6, { duration: 2400, easing: Easing.inOut(Easing.ease) }), -1, true)
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[{ position: 'absolute', borderRadius: 999 }, style, animStyle]} />;
}

export default function Welcome() {
  return (
    <LinearGradient
      colors={['#0D1B2A', '#1A2F4A', '#2C5F8A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={{ flex: 1 }}>

      {/* Background glow orbs */}
      <GlowOrb delay={0} style={{ width: 260, height: 260, backgroundColor: 'rgba(66,137,171,0.2)', top: -80, right: -80 }} />
      <GlowOrb delay={700} style={{ width: 180, height: 180, backgroundColor: 'rgba(109,184,216,0.12)', bottom: 100, left: -60 }} />
      <GlowOrb delay={350} style={{ width: 90, height: 90, backgroundColor: 'rgba(217,172,78,0.12)', top: '38%', right: 10 }} />

      <SafeAreaView style={w.safe}>

        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(80).duration(600)} style={w.hero}>
          <Image source={require('@/assets/images/Logo_noBG.png')} style={w.logo} resizeMode="contain" />
          <View style={w.badge}>
            <Star size={11} color="#D9AC4E" fill="#D9AC4E" />
            <Text style={w.badgeText}>SELLER CENTER</Text>
          </View>
          <Text style={w.heroTitle}>Start Selling{'\n'}on LUVLOTS</Text>
          <Text style={w.heroSub}>
            Join thousands of celebrities, influencers, and sellers on the Philippines' most exciting live auction marketplace.
          </Text>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(220).duration(550)} style={w.statsRow}>
          {[{ v: '2M+', l: 'Buyers' }, { v: '50K+', l: 'Sellers' }, { v: '99%', l: 'Satisfaction' }].map((s, i) => (
            <View key={i} style={[w.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.1)' }]}>
              <Text style={w.statValue}>{s.v}</Text>
              <Text style={w.statLabel}>{s.l}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Features */}
        <View style={w.features}>
          {FEATURES.map((feat, i) => (
            <Animated.View key={feat.title} entering={FadeInDown.delay(340 + i * 80).duration(500)} style={w.featureCard}>
              <View style={[w.iconWrap, { backgroundColor: feat.bg }]}>
                <feat.icon size={19} color={feat.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={w.featTitle}>{feat.title}</Text>
                <Text style={w.featDesc}>{feat.desc}</Text>
              </View>
              <CircleCheckBig size={15} color="rgba(255,255,255,0.2)" />
            </Animated.View>
          ))}
        </View>

        {/* CTA */}
        <Animated.View entering={FadeInUp.delay(580).duration(500)} style={w.ctaWrap}>
          <Pressable
            onPress={() => router.push('/(seller-registration)/ShopInfo')}
            style={({ pressed }) => [w.cta, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }]}>
            <View style={w.ctaGrad}>
              <Text style={w.ctaText}>Start Registration</Text>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#4289AB', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={16} color="#fff" />
              </View>
            </View>
          </Pressable>
          <Text style={w.ctaNote}>Free to join. No monthly fees.</Text>
        </Animated.View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const w = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: 22,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  hero: {
    paddingTop: 12,
  },
  logo: {
    width: 68,
    height: 68,
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(217,172,78,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(217,172,78,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  badgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#D9AC4E',
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 34,
    color: '#fff',
    lineHeight: 44,
    letterSpacing: -0.4,
  },
  heroSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 20,
    marginTop: 10,
    maxWidth: W * 0.82,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#fff',
  },
  statLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },
  features: {
    gap: 10,
    marginTop: 6,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#fff',
  },
  featDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.48)',
    marginTop: 2,
    lineHeight: 16,
  },
  ctaWrap: {
    alignItems: 'center',
    gap: 10,
  },
  cta: {
    width: '100%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    paddingHorizontal: 32,
    gap: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  ctaText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#2C6F91',
    letterSpacing: 0.3,
  },
  ctaNote: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },
});
