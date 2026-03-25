import '@/global.css';
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const preloadAssets = (assets: number[]) =>
  Promise.all(assets.map((asset) => Asset.fromModule(asset).downloadAsync()));

// Critical startup images to keep first paint snappy
const CRITICAL_ASSETS = [
  require('@/assets/images/Logo_noBG.png'),
  require('@/assets/images/onboard1.png'),
  require('@/assets/images/onboard2.png'),
  require('@/assets/images/onboard3.png'),
  require('@/assets/images/splash.png'),
  require('@/assets/images/icon.png'),
  require('@/assets/images/icon-luvlots.png'),
  require('@/assets/images/adaptive-icon.png'),
  require('@/assets/images/favicon.png'),
];

// Remaining images are preloaded after initial app render
const DEFERRED_ASSETS = [
  require('@/assets/images/seller.jpg'),
  require('@/assets/images/seller.png'),
  require('@/assets/images/jacket.png'),
  require('@/assets/images/watch.png'),
  require('@/assets/images/retro-jacket.png'),
  require('@/assets/images/retro-watch.png'),
  require('@/assets/images/item.png'),
  require('@/assets/images/gift.png'),
  require('@/assets/images/guitar-banner.png'),
  require('@/assets/images/profile-apl.png'),
  require('@/assets/images/apl-portrait.png'),
  require('@/assets/images/badge-check.png'),
  require('@/assets/images/react-native-reusables-dark.png'),
  require('@/assets/images/react-native-reusables-light.png'),
];

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Preload critical assets in parallel with fonts; avoid blocking too long.
  useEffect(() => {
    let isMounted = true;

    Promise.race([
      preloadAssets(CRITICAL_ASSETS),
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ])
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setAssetsLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loaded = (fontsLoaded || !!fontError) && assetsLoaded;

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded]);

  // Keep warming non-critical assets once the app is visible.
  useEffect(() => {
    if (!loaded) {
      return;
    }

    preloadAssets(DEFERRED_ASSETS).catch(() => {});
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={NAV_THEME['light']}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(profile)" />
        <Stack.Screen name="(seller-registration)" />
        <Stack.Screen name="(seller-dashboard)" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="donation" />
      </Stack>
    </ThemeProvider>
  );
}
