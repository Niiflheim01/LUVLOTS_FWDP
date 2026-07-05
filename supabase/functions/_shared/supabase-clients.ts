// deno-lint-ignore-file no-explicit-any
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

/**
 * Service-role client. Bypasses RLS entirely -- only ever use this for
 * writes that must not be reachable from the client app directly
 * (payment_attempts, payment_webhook_events, listing status transitions
 * driven by a verified webhook).
 */
export function createServiceRoleClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * User-scoped client, built from the caller's Authorization header, so all
 * normal RLS policies apply (e.g. a buyer can only ever read their own
 * payment_attempts row).
 */
export function createUserScopedClient(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Missing Authorization header.');
  }

  return createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') as string, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function getAuthenticatedUserId(req: Request): Promise<string> {
  const client = createUserScopedClient(req);
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    throw new Error('Not authenticated.');
  }
  return data.user.id;
}
