// Creates a payment_attempts row and a G8 Pay checkout session for a real
// `orders` row (one or more order_items -- a cart can hold items from
// multiple sellers). Called from lib/payments/g8pay.ts (createG8PayCheckout).
// Never called with a raw API key from the client -- this function holds
// the service role key and is the only thing allowed to write to
// payment_attempts.

import { corsHeaders, handleCorsPreflight } from '../_shared/cors.ts';
import { createServiceRoleClient, getAuthenticatedUserId } from '../_shared/supabase-clients.ts';
import { getG8PayAdapter } from '../_shared/g8pay-adapter.ts';

type RequestBody = {
  orderId: string;
  returnUrl: string;
  cancelUrl: string;
  metadata?: Record<string, unknown>;
};

Deno.serve(async (req) => {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;

  try {
    const buyerId = await getAuthenticatedUserId(req);
    const body = (await req.json()) as RequestBody;

    if (!body.orderId || !body.returnUrl || !body.cancelUrl) {
      return jsonResponse({ error: 'Missing required fields.' }, 400);
    }

    const admin = createServiceRoleClient();

    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, buyer_id, status, currency')
      .eq('id', body.orderId)
      .single();

    if (orderError || !order) {
      return jsonResponse({ error: 'Order not found.' }, 404);
    }
    if (order.buyer_id !== buyerId) {
      return jsonResponse({ error: 'This order does not belong to you.' }, 403);
    }
    if (order.status !== 'pending') {
      return jsonResponse({ error: 'This order is not awaiting payment.' }, 409);
    }

    // Re-derive the charge amount server-side from order_items (which were
    // themselves snapshotted from listings by a DB trigger) -- never trust
    // a client-supplied amount.
    const { data: orderItems, error: itemsError } = await admin
      .from('order_items')
      .select('unit_price, quantity, listing_id, seller_id')
      .eq('order_id', order.id);

    if (itemsError || !orderItems || orderItems.length === 0) {
      return jsonResponse({ error: 'Order has no items.' }, 409);
    }

    const amount = orderItems.reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0);

    // Ganap only accepts 0 (free) or 200-50000 (whole PHP pesos) per checkout.
    if (amount !== 0 && (amount < 200 || amount > 50000)) {
      return jsonResponse(
        { error: "This order's total is outside the range G8 Pay can process (₱200 - ₱50,000)." },
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

    // Single-seller carts still record which seller this was for; a mixed
    // cart across sellers leaves seller_id null on the payment attempt
    // (the authoritative per-item seller is on order_items).
    const distinctSellerIds = [...new Set(orderItems.map((item) => item.seller_id))];
    const singleSellerId = distinctSellerIds.length === 1 ? distinctSellerIds[0] : null;

    const { data: attempt, error: attemptError } = await admin
      .from('payment_attempts')
      .insert({
        order_id: order.id,
        buyer_id: buyerId,
        seller_id: singleSellerId,
        listing_id: orderItems.length === 1 ? orderItems[0].listing_id : null,
        provider: 'g8_pay',
        amount,
        currency: order.currency ?? 'PHP',
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
        amount,
        currency: attempt.currency,
        orderId: order.id,
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

      // providerTransactionId (Ganap's referenceNumber) is deliberately never
      // returned to the client: it's one half of the webhook handler's only
      // integrity check (the other being amount), since Ganap's webhook has
      // no signature (see g8pay-adapter.ts). If the buyer learned their own
      // referenceNumber, they could POST a forged "paid" webhook straight to
      // the public webhook URL and mark their own order paid for free.
      return jsonResponse({
        paymentAttemptId: attempt.id,
        qrPayload: checkout.qrPayload,
        payloadType: checkout.payloadType,
        expiresAt: checkout.expiresAt,
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
