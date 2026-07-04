// G8 Pay webhook receiver. This is the ONLY path allowed to mark a
// payment_attempts row "paid" -- the client-side "success" screen is never
// trusted on its own (see lib/payments/g8pay.ts and CLAUDE/brief notes).
//
// Every delivery (verified or not) is logged to payment_webhook_events for
// audit purposes. Processing is idempotent on provider_event_id: a
// re-delivered webhook for an event we've already processed is a no-op.

import { corsHeaders, handleCorsPreflight } from '../_shared/cors.ts';
import { createServiceRoleClient } from '../_shared/supabase-clients.ts';
import { getG8PayAdapter } from '../_shared/g8pay-adapter.ts';

Deno.serve(async (req) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const rawBody = await req.text();
  const admin = createServiceRoleClient();

  let event;
  try {
    const adapter = getG8PayAdapter();
    event = await adapter.verifyWebhookSignature(rawBody, req.headers);
  } catch (verifyError) {
    // Log the unverifiable delivery for debugging, but never act on it.
    await admin.from('payment_webhook_events').insert({
      provider: 'g8_pay',
      provider_event_id: `unverified-${crypto.randomUUID()}`,
      payload: safeJsonParse(rawBody),
      signature_verified: false,
    });

    const message = verifyError instanceof Error ? verifyError.message : 'Webhook verification failed.';
    return jsonResponse({ error: message }, 501);
  }

  // Idempotency: if we've already processed this exact provider event id,
  // acknowledge and exit without reprocessing.
  const { data: existing } = await admin
    .from('payment_webhook_events')
    .select('id, processed_at')
    .eq('provider', 'g8_pay')
    .eq('provider_event_id', event.providerEventId)
    .maybeSingle();

  if (existing?.processed_at) {
    return jsonResponse({ received: true, alreadyProcessed: true });
  }

  const { data: loggedEvent, error: logError } = await admin
    .from('payment_webhook_events')
    .upsert(
      {
        provider: 'g8_pay',
        provider_event_id: event.providerEventId,
        payload: event.rawPayload,
        signature_verified: true,
      },
      { onConflict: 'provider,provider_event_id' },
    )
    .select('*')
    .single();

  if (logError || !loggedEvent) {
    return jsonResponse({ error: 'Failed to log webhook event.' }, 500);
  }

  const { data: attempt } = await admin
    .from('payment_attempts')
    .select('*')
    .eq('provider_transaction_id', event.providerTransactionId)
    .maybeSingle();

  if (!attempt) {
    await admin
      .from('payment_webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', loggedEvent.id);
    return jsonResponse({ received: true, matchedAttempt: false });
  }

  // Ganap's webhook has no signature (see g8pay-adapter.ts) -- as a
  // best-effort integrity check, the reported amount must match exactly
  // what we charged for on this attempt before we ever act on it.
  if (Number(attempt.amount) !== event.amount) {
    await admin
      .from('payment_webhook_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', loggedEvent.id);
    return jsonResponse({ received: true, matchedAttempt: true, amountMismatch: true }, 409);
  }

  const alreadyPaid = attempt.status === 'paid';

  await admin
    .from('payment_attempts')
    .update({ status: event.status, provider_response: event.rawPayload })
    .eq('id', attempt.id);

  if (event.status === 'paid' && !alreadyPaid) {
    if (attempt.order_id) {
      await admin.from('orders').update({ status: 'paid' }).eq('id', attempt.order_id);
    }
    if (attempt.listing_id) {
      await admin
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', attempt.listing_id)
        .eq('status', 'live');
    }
  }

  await admin
    .from('payment_webhook_events')
    .update({ processed_at: new Date().toISOString() })
    .eq('id', loggedEvent.id);

  return jsonResponse({ received: true, matchedAttempt: true });
});

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
