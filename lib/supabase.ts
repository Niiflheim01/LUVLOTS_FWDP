import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { env } from '@/lib/env';

const supabaseUrl = env.supabaseUrl || 'https://unconfigured.supabase.co';
const supabaseAnonKey = env.supabaseAnonKey || 'unconfigured-anon-key';

// Platform.OS reports 'web' both in a real browser AND in the Node process
// that expo-router's static web export uses to pre-render routes (no
// `window` there) -- guard against that or SSR crashes trying to reach
// into window.localStorage via AsyncStorage.
const isBrowser = typeof window !== 'undefined';

const secureStorage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return isBrowser ? AsyncStorage.getItem(key) : null;
    }

    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      if (isBrowser) await AsyncStorage.setItem(key, value);
      return;
    }

    return SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      if (isBrowser) await AsyncStorage.removeItem(key);
      return;
    }

    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Required for the OAuth callback to include ?code=... (consumed by
    // exchangeCodeForSession in lib/auth-context.tsx) instead of tokens in
    // the URL hash fragment (the default "implicit" flow).
    flowType: 'pkce',
  },
});

