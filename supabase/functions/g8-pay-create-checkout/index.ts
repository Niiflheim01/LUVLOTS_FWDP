// Creates a payment_attempts row and a G8 Pay checkout session for it.
// Called from lib/payments/g8pay.ts (createG8PayCheckout). Never called
// with a raw API key from the client -- this function holds the service
// role key and is the only thing allowed to write to payment_attempts.

import { corsHeaders, handleCorsPreflight } from '../_shared/cors.ts';
import { createServiceRoleClient, getAuthenticatedUserId } from '../_shared/supabase-clients.ts';
import { getG8PayAdapter } from '../_shared/g8pay-adapter.ts';

type RequestBody = {
  listingId: string;
  sellerId?: string;
  amount: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
};

Deno.serve(async (req) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  try {
    const buyerId = await getAuthenticatedUserId(req);
    const body = (await req.json()) as RequestBody;

    if (!body.listingId || !body.amount || !body.currency || !body.returnUrl || !body.cancelUrl) {
      return jsonResponse({ error: 'Missing required fields.' }, 400);
    }

    const admin = createServiceRoleClient();

    // Re-derive price server-side from the live listing -- never trust the
    // client-supplied amount for the actual charge.
    const { data: listing, error: listingError } = await admin
      .from('listings')
      .select('id, seller_id, price, currency, status')
      .eq('id', body.listingId)
      .single();

    if (listingError || !listing) {
      return jsonResponse({ error: 'Listing not found.' }, 404);
    }

    if (listing.status !== 'live') {
      return jsonResponse({ error: 'Listing is not available for purchase.' }, 409);
    }

    // Ganap only accepts 0 (free) or 200-50000 (whole PHP pesos) per project checkout.
    if (listing.price !== 0 && (listing.price < 200 || listing.price > 50000)) {
      return jsonResponse(
        { error: 'This item\'s price is outside the range G8 Pay can process (₱200 - ₱50,000).' },
        422,
      );
    }

    const { data: authUser } = await admin.auth.admin.getUserById(buyerId);
    const { data: buyerProfile } = await admin
      .from('profiles')
      .select('full_name, username')
      .eq('id', buyerId)
      .maybeSingle();

    const payerEmail = authUser?.user?.email ?? '';
    const payerName = buyerProfile?.full_name ?? buyerProfile?.username ?? 'LUVLOTS Buyer';

    const { data: attempt, error: attemptError } = await admin
      .from('payment_attempts')
      .insert({
        order_id: body.orderId ?? null,
        buyer_id: buyerId,
        seller_id: listing.seller_id,
        listing_id: listing.id,
        provider: 'g8_pay',
        amount: listing.price,
        currency: listing.currency,
        status: 'created',
      })
      .select('*')
      .single();

    if (attemptError || !attempt) {
      return jsonResponse({ error: 'Could not create payment attempt.' }, 500);
    }

    try {
      const adapter = getG8PayAdapter();
      const checkout = await adapter.createCheckout({
        paymentAttemptId: attempt.id,
        amount: listing.price,
        currency: listing.currency,
        orderId: body.orderId ?? null,
        returnUrl: body.returnUrl,
        cancelUrl: body.cancelUrl,
        payerEmail,
        payerName,
        metadata: body.metadata,
      });

      await admin
        .from('payment_attempts')
        .update({
          status: 'pending',
          provider_transaction_id: checkout.providerTransactionId,
          checkout_url: checkout.qrPayload,
          provider_response: checkout.rawResponse,
        })
        .eq('id', attempt.id);

      return jsonResponse({
        paymentAttemptId: attempt.id,
        qrPayload: checkout.qrPayload,
        payloadType: checkout.payloadType,
        expiresAt: checkout.expiresAt,
        providerTransactionId: checkout.providerTransactionId,
      });
    } catch (adapterError) {
      // Adapter isn't implemented yet (no official G8 Pay docs) -- mark the
      // attempt as failed rather than leaving it stuck in "created" forever.
      await admin.from('payment_attempts').update({ status: 'failed' }).eq('id', attempt.id);
      const message = adapterError instanceof Error ? adapterError.message : 'G8 Pay is not configured.';
      return jsonResponse({ error: message }, 501);
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
