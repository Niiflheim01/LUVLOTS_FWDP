import React, { useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Star } from 'lucide-react-native';

// Each star: position, size, twinkle speed, float drift
const STARS = [
  { top: '8%',  left: '10%',  size: 14, delay: 0,    dur: 2000, fx: 9,   fy: -7,  fdx: 3800, fdy: 4200 },
  { top: '12%', right: '18%', size: 10, delay: 400,  dur: 2600, fx: -8,  fy: 6,   fdx: 4600, fdy: 3600 },
  { top: '22%', left: '5%',   size: 7,  delay: 200,  dur: 2200, fx: 7,   fy: -10, fdx: 5000, fdy: 4000 },
  { top: '18%', right: '8%',  size: 8,  delay: 700,  dur: 1900, fx: -11, fy: -8,  fdx: 4400, fdy: 3200 },
  { top: '35%', right: '5%',  size: 11, delay: 900,  dur: 2400, fx: 8,   fy: 11,  fdx: 5200, fdy: 3800 },
  { top: '50%', left: '7%',   size: 16, delay: 300,  dur: 2100, fx: -7,  fy: 9,   fdx: 4000, fdy: 4600 },
  { top: '55%', right: '10%', size: 9,  delay: 600,  dur: 2300, fx: 10,  fy: -6,  fdx: 3600, fdy: 5000 },
  { top: '65%', left: '20%',  size: 12, delay: 1000, dur: 2500, fx: -9,  fy: -11, fdx: 4800, fdy: 3400 },
  { top: '72%', right: '22%', size: 8,  delay: 150,  dur: 1800, fx: 11,  fy: 8,   fdx: 4200, fdy: 4800 },
  { top: '80%', left: '12%',  size: 10, delay: 550,  dur: 2200, fx: -6,  fy: -9,  fdx: 5400, fdy: 3600 },
  { top: '85%', right: '14%', size: 13, delay: 800,  dur: 2600, fx: 8,   fy: 12,  fdx: 3800, fdy: 4400 },
  { top: '42%', left: '48%',  size: 6,  delay: 1100, dur: 2000, fx: -10, fy: -7,  fdx: 4600, fdy: 5200 },
];

type StarConfig = typeof STARS[0];

function FloatingStar({ config }: { config: StarConfig }) {
  const opacity = useSharedValue(0.15);
  const fx = useSharedValue(0);
  const fy = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      config.delay,
      withRepeat(withTiming(0.85, { duration: config.dur, easing: Easing.inOut(Easing.ease) }), -1, true)
    );
    fx.value = withDelay(
      config.delay,
      withRepeat(withTiming(config.fx, { duration: config.fdx, easing: Easing.inOut(Easing.ease) }), -1, true)
    );
    fy.value = withDelay(
      config.delay,
      withRepeat(withTiming(config.fy, { duration: config.fdy, easing: Easing.inOut(Easing.ease) }), -1, true)
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: 0.5 + opacity.value * 0.5 },
      { translateX: fx.value },
      { translateY: fy.value },
    ],
  }));

  const posStyle: any = { position: 'absolute' };
  if (config.top) posStyle.top = config.top;
  if ((config as any).left) posStyle.left = (config as any).left;
  if ((config as any).right) posStyle.right = (config as any).right;

  return (
    <Animated.View style={[posStyle, animStyle]}>
      <Star size={config.size} color="rgba(255,255,255,0.75)" fill="rgba(255,255,255,0.45)" />
    </Animated.View>
  );
}

export default function SplashLanding() {
  function handleContinue() {
    router.push('/(auth)/Onboarding');
  }

  return (
    <Pressable style={{ flex: 1 }} onPress={handleContinue}>
      <LinearGradient
        colors={['#12334F', '#1E5278', '#3A7CA5', '#6DB8D8']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          {/* 12 floating stars */}
          {STARS.map((cfg, i) => (
            <FloatingStar key={i} config={cfg} />
          ))}

          {/* Logo + text stacked together */}
          <View style={styles.centerBlock}>
            <Animated.View entering={FadeIn.duration(1000)}>
              <Image
                source={require('@/assets/images/Logo_noBG.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>

            <Animated.Text
              entering={FadeInUp.delay(400).duration(800)}
              style={styles.brandName}>
              LUVLOTS
            </Animated.Text>

            <Animated.View entering={FadeInUp.delay(700).duration(800)}>
              <View style={styles.taglineContainer}>
                <View style={styles.taglineLine} />
                <Text style={styles.taglineStar}>★</Text>
                <View style={styles.taglineLine} />
              </View>
              <Text style={styles.tagline}>A STAR-STUDDED</Text>
              <Text style={styles.tagline}>SHOPPING DESTINATION</Text>
            </Animated.View>
          </View>

          {/* Bottom tap hint */}
          <Animated.View entering={FadeInDown.delay(1200).duration(800)} style={styles.bottomHint}>
            <Text style={styles.hintText}>Tap anywhere to continue</Text>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBlock: {
    alignItems: 'center',
  },
  logo: {
    width: 190,
    height: 190,
  },
  brandName: {
    fontSize: 32,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 14,
    marginLeft: 14,
    marginTop: 2,
    marginBottom: 16,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 12,
  },
  taglineLine: {
    width: 50,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  taglineStar: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  tagline: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 5,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomHint: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
  },
  hintText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
});
