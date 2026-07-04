// Looks up the current status of a payment attempt. Called from
// lib/payments/g8pay.ts (getG8PayStatus) for client-side polling/UI state.
// The webhook handler (g8-pay-webhook) remains the source of truth for
// marking a payment "paid" -- this endpoint only refreshes from the
// provider when the attempt isn't already in a terminal state.

import { corsHeaders, handleCorsPreflight } from '../_shared/cors.ts';
import { createServiceRoleClient, getAuthenticatedUserId } from '../_shared/supabase-clients.ts';
import { getG8PayAdapter } from '../_shared/g8pay-adapter.ts';

type RequestBody = {
  paymentAttemptId: string;
};

const TERMINAL_STATUSES = new Set(['paid', 'failed', 'cancelled', 'expired', 'refunded']);

Deno.serve(async (req) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  try {
    const buyerId = await getAuthenticatedUserId(req);
    const { paymentAttemptId } = (await req.json()) as RequestBody;

    if (!paymentAttemptId) {
      return jsonResponse({ error: 'paymentAttemptId is required.' }, 400);
    }

    const admin = createServiceRoleClient();
    const { data: attempt, error } = await admin
      .from('payment_attempts')
      .select('*')
      .eq('id', paymentAttemptId)
      .eq('buyer_id', buyerId)
      .single();

    if (error || !attempt) {
      return jsonResponse({ error: 'Payment attempt not found.' }, 404);
    }

    if (TERMINAL_STATUSES.has(attempt.status) || !attempt.provider_transaction_id) {
      return jsonResponse(attempt);
    }

    try {
      const adapter = getG8PayAdapter();
      const status = await adapter.getStatus(attempt.provider_transaction_id);

      const { data: updated } = await admin
        .from('payment_attempts')
        .update({ status: status.status, provider_response: status.rawResponse })
        .eq('id', attempt.id)
        .select('*')
        .single();

      return jsonResponse(updated ?? attempt);
    } catch {
      // Adapter not configured yet -- return the last known DB state
      // instead of failing the whole request.
      return jsonResponse(attempt);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    return jsonResponse({ error: message }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
