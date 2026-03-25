import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Dimensions,
  FlatList,
  ViewToken,
  Animated as RNAnimated,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';

const { width: W, height: H } = Dimensions.get('window');
const RING_SIZE  = Math.min(W * 0.5, 210);
const IMAGE_SIZE = Math.min(W * 0.88, 350);   // bigger image

const SLIDES = [
  {
    id: '1',
    title: 'Shop Iconic\nPieces',
    subtitle: 'Bid or instantly purchase unique items from your favorite stars.',
    image: require('@/assets/images/onboard1.png'),
    tag: 'Shop',
  },
  {
    id: '2',
    title: 'Own the\nSpotlight',
    subtitle: 'Own pre-loved signature pieces while contributing to a worthwhile cause.',
    image: require('@/assets/images/onboard2.png'),
    tag: 'Give',
  },
  {
    id: '3',
    title: 'Sparkle with\nPrestige',
    subtitle: 'Shop pre-loved and exclusive pieces from designers and sustainable brands.',
    image: require('@/assets/images/onboard3.png'),
    tag: 'Shine',
  },
];

function FloatDot({ top, left, right, size, delay, dx, dy }: {
  top?: any; left?: any; right?: any; size: number; delay: number; dx: number; dy: number;
}) {
  const opacity = useSharedValue(0);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withTiming(0.4, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true));
    tx.value = withDelay(delay, withRepeat(withTiming(dx, { duration: 4200 }), -1, true));
    ty.value = withDelay(delay, withRepeat(withTiming(dy, { duration: 3800 }), -1, true));
  }, []);
  const anim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));
  const pos: any = { position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: 'rgba(255,255,255,0.55)' };
  if (top !== undefined) pos.top = top;
  if (left !== undefined) pos.left = left;
  if (right !== undefined) pos.right = right;
  return <Animated.View style={[pos, anim]} />;
}

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new RNAnimated.Value(0)).current;
  const titleAnim = useRef(new RNAnimated.Value(0)).current;
  const subtitleAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.spring(titleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 9 }),
      RNAnimated.spring(subtitleAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 10, delay: 100 } as any),
    ]).start();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0] && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
      titleAnim.setValue(0);
      subtitleAnim.setValue(0);
      RNAnimated.parallel([
        RNAnimated.spring(titleAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 9 }),
        RNAnimated.spring(subtitleAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 10, delay: 100 } as any),
      ]).start();
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  function handleContinue() {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      router.replace('/(auth)/SignUp');
    }
  }

  const titleStyle = {
    opacity: titleAnim,
    transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }],
  };
  const subtitleStyle = {
    opacity: subtitleAnim,
    transform: [{ translateY: subtitleAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1A4A6E' }}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={RNAnimated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        style={{ flex: 1 }}
        renderItem={({ item, index }) => (
          <LinearGradient
            colors={['#12334F', '#1E5278', '#3A7CA5', '#5BAACC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.3, y: 1 }}
            style={{ width: W, height: H }}>

            {/* Floating dots — matches splash screen energy */}
            <FloatDot top="10%" left="8%"  size={5} delay={0}    dx={8}  dy={-6} />
            <FloatDot top="15%" right="14%" size={4} delay={400}  dx={-7} dy={5}  />
            <FloatDot top="32%" left="4%"  size={6} delay={800}  dx={5}  dy={-9} />
            <FloatDot top="22%" right="4%" size={3} delay={300}  dx={-5} dy={7}  />
            <FloatDot top="48%" right="10%" size={5} delay={600}  dx={7}  dy={-5} />
            <FloatDot top="58%" left="6%"  size={4} delay={200}  dx={-8} dy={6}  />
            <FloatDot top="68%" right="18%" size={6} delay={1000} dx={6}  dy={-7} />
            <FloatDot top="40%" left="50%" size={3} delay={700}  dx={-4} dy={-8} />

            <SafeAreaView style={s.slide}>
              {/* Top bar */}
              <View style={s.topBar}>
                <View style={s.dotsRow}>
                  {SLIDES.map((_, i) => {
                    const inputRange = [(i - 1) * W, i * W, (i + 1) * W];
                    const dotW = scrollX.interpolate({ inputRange, outputRange: [7, 22, 7], extrapolate: 'clamp' });
                    const dotO = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
                    return <RNAnimated.View key={i} style={[s.dot, { width: dotW, opacity: dotO }]} />;
                  })}
                </View>
                <Pressable onPress={() => router.replace('/(auth)/SignUp')} hitSlop={14}>
                  <Text style={s.skipText}>Skip</Text>
                </Pressable>
              </View>

              {/* ── Image pushed lower + scaled up ── */}
              <View style={s.imageSection}>
                <View style={s.ring2} />
                <View style={s.ring1} />
                <Image source={item.image} style={s.heroImage} resizeMode="contain" />
                {/* Gold badge below image */}
                <View style={s.tagBadge}>
                  <Text style={s.tagText}>{item.tag}</Text>
                </View>
              </View>

              {/* ── Text ── */}
              <View style={s.textSection}>
                <View style={s.accentLine} />
                <RNAnimated.Text style={[s.title, titleStyle]}>{item.title}</RNAnimated.Text>
                <RNAnimated.Text style={[s.subtitle, subtitleStyle]}>{item.subtitle}</RNAnimated.Text>
              </View>

              {/* ── CTA — rounded pill button ── */}
              <View style={s.bottomArea}>
                <Pressable
                  onPress={handleContinue}
                  style={({ pressed }) => [s.ctaBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}>
                  <View style={s.ctaGrad}>
                    <Text style={s.ctaText}>
                      {index === SLIDES.length - 1 ? "Let's Start" : 'Continue'}
                    </Text>
                    <View style={s.ctaArrow}>
                      <ChevronRight size={16} color="#fff" />
                    </View>
                  </View>
                </Pressable>
                <Text style={s.stepText}>{index + 1} / {SLIDES.length}</Text>
              </View>
            </SafeAreaView>
          </LinearGradient>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  slide: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingTop: 8,
  },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 6, borderRadius: 3, backgroundColor: '#fff' },
  skipText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.5)' },

  imageSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  ring2: {
    position: 'absolute',
    bottom: 30,
    width: RING_SIZE * 1.85,
    height: RING_SIZE * 1.85,
    borderRadius: RING_SIZE,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  ring1: {
    position: 'absolute',
    bottom: 30 + (RING_SIZE * 1.85 - RING_SIZE * 1.38) / 2,
    width: RING_SIZE * 1.38,
    height: RING_SIZE * 1.38,
    borderRadius: RING_SIZE * 0.7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginBottom: -20,
  },
  tagBadge: {
    marginTop: 20,
    backgroundColor: 'rgba(217,172,78,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(217,172,78,0.35)',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tagText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#D9AC4E',
    letterSpacing: 0.8,
  },

  textSection: {
    paddingHorizontal: 28,
    paddingBottom: 10,
  },
  accentLine: {
    width: 30,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.38)',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 34,
    color: '#fff',
    lineHeight: 44,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 10,
    lineHeight: 22,
  },

  bottomArea: {
    paddingHorizontal: 28,
    paddingBottom: 30,
    alignItems: 'center',
    gap: 12,
  },
  ctaBtn: {
    width: '100%',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  ctaText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#2C6F91',
    letterSpacing: 0.3,
  },
  ctaArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4289AB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.38)',
  },
});
