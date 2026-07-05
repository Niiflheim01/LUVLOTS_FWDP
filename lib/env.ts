import Constants from 'expo-constants';

type ExtraConfig = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  appUrl?: string;
  sentryDsn?: string;
  enableG8Pay?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabaseUrl ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabaseAnonKey ?? '',
  appUrl: process.env.EXPO_PUBLIC_APP_URL ?? extra.appUrl ?? 'luvlots://',
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? extra.sentryDsn ?? '',
  enableG8Pay: (process.env.EXPO_PUBLIC_ENABLE_G8_PAY ?? extra.enableG8Pay ?? 'false') === 'true',
};

export function assertPublicSupabaseEnv() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
}

