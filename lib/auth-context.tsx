import { makeRedirectUri } from 'expo-auth-session';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { assertPublicSupabaseEnv, env } from '@/lib/env';
import { logError } from '@/lib/observability';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/marketplace';
import type { Provider, Session, User } from '@supabase/supabase-js';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (input: { email: string; password: string; username: string }) => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getRedirectUrl() {
  return makeRedirectUri({
    scheme: 'luvlots',
    path: 'auth/callback',
  });
}

async function upsertProfile(user: User) {
  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === 'string'
      ? metadata.full_name
      : typeof metadata.name === 'string'
        ? metadata.name
        : null;

  // Include a slice of the user id so two people with the same email
  // local-part (different domains) don't collide on the unique username
  // constraint. Users can change it later in Edit Profile.
  const username =
    typeof metadata.username === 'string'
      ? metadata.username
      : `${user.email?.split('@')[0] ?? 'user'}-${user.id.slice(0, 8)}`;

  const avatarUrl =
    typeof metadata.avatar_url === 'string'
      ? metadata.avatar_url
      : typeof metadata.picture === 'string'
        ? metadata.picture
        : null;

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      full_name: fullName,
      username: username.toLowerCase(),
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  // Non-fatal: the on_auth_user_created DB trigger already created a
  // fallback profile row, so a failure here shouldn't block sign-in.
  if (error) logError(error, { area: 'upsertProfile' });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (activeSession = session) => {
    if (!activeSession?.user) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, role, bio, created_at, updated_at')
      .eq('id', activeSession.user.id)
      .maybeSingle();

    if (error) {
      logError(error, { area: 'loadProfile' });
      setProfile(null);
      return;
    }

    setProfile((data as Profile | null) ?? null);
  }, [session]);

  useEffect(() => {
    let mounted = true;

    if (!env.supabaseUrl || !env.supabaseAnonKey) {
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        await loadProfile(data.session);
      })
      .catch((error) => logError(error, { area: 'getSession' }))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      await loadProfile(nextSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    assertPublicSupabaseEnv();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    if (data.user) await upsertProfile(data.user);
    router.replace('/(tabs)/(store)');
  }, []);

  const signUpWithPassword = useCallback(async (input: { email: string; password: string; username: string }) => {
    assertPublicSupabaseEnv();
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        data: {
          username: input.username.trim(),
        },
        emailRedirectTo: getRedirectUrl(),
      },
    });

    if (error) throw error;
    if (data.user) await upsertProfile(data.user);
    router.replace('/(tabs)/(store)');
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'facebook') => {
    assertPublicSupabaseEnv();
    const redirectTo = getRedirectUrl();
    // TEMPORARY DEBUG -- remove once the Supabase Redirect URLs allow-list is confirmed working.
    if (__DEV__) {
      Alert.alert('DEBUG redirectTo', redirectTo);
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error('OAuth provider did not return an authorization URL.');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'cancel') {
      throw new Error('Sign-in was cancelled.');
    }
    if (result.type !== 'success') {
      throw new Error('Sign-in did not complete.');
    }

    // TEMPORARY DEBUG -- remove once the OAuth callback is confirmed working.
    if (__DEV__) {
      Alert.alert('DEBUG result.url', result.url);
    }

    const callbackUrl = new URL(result.url);
    const code = callbackUrl.searchParams.get('code');
    if (!code) {
      throw new Error('OAuth callback did not include an authorization code.');
    }

    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
    if (sessionData.user) await upsertProfile(sessionData.user);
    router.replace('/(tabs)/(store)');
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    assertPublicSupabaseEnv();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: getRedirectUrl(),
    });

    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.replace('/(auth)');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signInWithPassword,
      signUpWithPassword,
      signInWithOAuth,
      resetPassword,
      signOut,
      refreshProfile: () => loadProfile(session),
    }),
    [loadProfile, loading, profile, resetPassword, session, signInWithOAuth, signInWithPassword, signOut, signUpWithPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}

