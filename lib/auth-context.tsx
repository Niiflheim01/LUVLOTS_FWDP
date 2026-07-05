import Constants, { AppOwnership } from 'expo-constants';
import { makeRedirectUri } from 'expo-auth-session';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

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
  signUpWithPassword: (input: { email: string; password: string; username: string }) => Promise<{ needsEmailConfirmation: boolean }>;
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getRedirectUrl() {
  // In Expo Go the custom "luvlots://" native scheme isn't registered, so an
  // OAuth redirect to it never comes back to the app -- the WebBrowser
  // session just hangs on a stuck spinner until the timeout. There,
  // makeRedirectUri (with no scheme) returns the exp://<host> dev URL, which
  // Expo Go CAN catch. In a dev-client / standalone build the real
  // luvlots:// scheme works and is used instead.
  //
  // NOTE: whichever URL this returns must be in the Supabase Dashboard ->
  // Authentication -> URL Configuration -> Redirect URLs allow-list. For
  // Expo Go add `exp://**` (the host/port changes per machine); for release
  // builds add `luvlots://auth/callback`.
  if (Constants.appOwnership === AppOwnership.Expo) {
    return makeRedirectUri({ path: 'auth/callback' });
  }
  return makeRedirectUri({ scheme: 'luvlots', path: 'auth/callback' });
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
      .select(
        'id, full_name, username, avatar_url, role, bio, created_at, updated_at, ' +
          'verification_status, verification_type, verification_note, verification_document_url, verification_requested_at',
      )
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

    if (error) {
      const raw = error.message.toLowerCase();
      // "Invalid login credentials" is Supabase's catch-all -- it's also
      // what you get if this email only has a Google identity (no password
      // was ever set). Point the user at the right button instead.
      if (raw.includes('invalid login credentials')) {
        throw new Error(
          "Wrong email or password. If you signed up with Google, use the “Continue with Google” button instead — that account has no password.",
        );
      }
      if (raw.includes('email not confirmed')) {
        throw new Error('Please confirm your email first. Check your inbox for the confirmation link, then try again.');
      }
      throw error;
    }
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

    if (error) {
      const raw = error.message.toLowerCase();
      if (raw.includes('rate limit') || raw.includes('too many')) {
        throw new Error(
          "Too many sign-up attempts in a short time (Supabase's built-in email service is limited to a few per hour). Wait a few minutes, or disable email confirmation in Supabase for testing.",
        );
      }
      if (raw.includes('invalid') && raw.includes('email')) {
        throw new Error(
          'That email address was rejected. Use a real, correctly-formatted address — test/example domains (e.g. test@test.com) are often blocked.',
        );
      }
      if (raw.includes('already registered') || raw.includes('already been registered') || raw.includes('user already')) {
        throw new Error('An account with this email already exists. Try logging in instead.');
      }
      throw error;
    }

    // When "Confirm email" is ON in Supabase, signUp returns a user but NO
    // session -- the account can't be used until the emailed link is clicked.
    // Only navigate into the app when we actually have a session; otherwise
    // tell the caller to show a "check your email" message (navigating in
    // would drop the user into a logged-in-looking UI with no real session).
    if (data.session && data.user) {
      await upsertProfile(data.user);
      router.replace('/(tabs)/(store)');
      return { needsEmailConfirmation: false };
    }
    return { needsEmailConfirmation: true };
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'facebook') => {
    assertPublicSupabaseEnv();
    const redirectTo = getRedirectUrl();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error('OAuth provider did not return an authorization URL.');

    // When Google has already authorized this app for the account (e.g.
    // signing up again with an account that already has a LUVLOTS user),
    // it can auto-redirect almost instantly. On Android that redirect is
    // sometimes delivered straight to the app via the OS deep-link handler,
    // bypassing the Custom Tab's own callback -- which leaves
    // openAuthSessionAsync's promise unresolved forever (a stuck loading
    // spinner). Race it against a direct Linking listener, plus a hard
    // timeout so this can never hang indefinitely either way.
    const resultUrl = await new Promise<string>((resolve, reject) => {
      let settled = false;

      const finish = (fn: () => void) => {
        if (settled) return;
        settled = true;
        subscription.remove();
        clearTimeout(timeoutId);
        fn();
      };

      const subscription = Linking.addEventListener('url', (event) => {
        if (event.url.startsWith(redirectTo)) {
          finish(() => {
            WebBrowser.dismissBrowser();
            resolve(event.url);
          });
        }
      });

      const timeoutId = setTimeout(() => {
        finish(() => reject(new Error('Sign-in timed out. Please try again.')));
      }, 45000);

      WebBrowser.openAuthSessionAsync(data.url as string, redirectTo)
        .then((result) => {
          if (result.type === 'success' && result.url) {
            finish(() => resolve(result.url));
          } else if (result.type === 'cancel' || result.type === 'dismiss') {
            finish(() => reject(new Error('Sign-in was cancelled.')));
          } else {
            finish(() => reject(new Error('Sign-in did not complete.')));
          }
        })
        .catch((err) => finish(() => reject(err)));
    });

    const callbackUrl = new URL(resultUrl);
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

