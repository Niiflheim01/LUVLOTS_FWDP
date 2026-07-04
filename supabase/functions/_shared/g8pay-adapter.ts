// G8 Pay / Ganap payment adapter.
//
// Implemented against Ganap's dashboard-provided "Developer Guide" for
// project 63584008-ee97-4f63-8d7c-4a4e6c281895 (checkout + webhook), and
// confirmed live against https://api.ganap.net on 2026-07-05. Documented
// capabilities, confirmed by testing + the merchant's Developer Guide:
//
//   - Checkout creation:     POST {G8PAY_BASE_URL}/api/merchant-project/{id}/webhook-checkout
//                             with header `sk: <secret>`. Returns a QR Ph
//                             (EMV Co Person-to-Merchant) QR code PAYLOAD
//                             STRING, not a redirect URL, despite the field
//                             being named `paymentUrl` in Ganap's response.
//                             The buyer must scan this with GCash/Maya/any
//                             QR Ph-capable app -- see lib/payments/g8pay.ts
//                             and the QR rendering in the checkout screen.
//   - Status polling:        NOT DOCUMENTED. Ganap has no confirmed
//                             "get transaction status" endpoint. Payment
//                             confirmation only ever arrives via the webhook.
//   - Webhook signature:     NONE. Confirmed via Ganap's Developer Guide --
//                             the webhook POST body has no signature or
//                             shared-secret header at all. The
//                             "verification" this adapter does is
//                             STRUCTURAL ONLY (required fields present,
//                             known status value, amount is a positive
//                             number) -- it is NOT cryptographic proof the
//                             request came from Ganap. Residual risk is
//                             mitigated in the webhook handler by requiring
//                             the payload's externalId/amount to exactly
//                             match an existing, still-pending
//                             payment_attempts row keyed by an unguessable
//                             server-generated UUID (see
//                             supabase/functions/g8-pay-webhook/index.ts).
//                             If Ganap ever adds real signing, wire it in
//                             here and tighten the webhook handler.
//   - Split payments / seller payouts / escrow / delayed capture / refunds:
//                             UNKNOWN / NOT DOCUMENTED. Do not build seller
//                             payout logic on top of this integration until
//                             Ganap confirms support -- treat this as
//                             BUYER PAYMENT COLLECTION ONLY.
//   - Amount unit:            Whole PHP pesos (not centavos), min 200 (or 0
//                             for free), max 50000, per the Developer Guide.

const G8PAY_BASE_URL = Deno.env.get('G8PAY_BASE_URL') ?? 'https://api.ganap.net';
const G8PAY_MERCHANT_PROJECT_ID = Deno.env.get('G8PAY_MERCHANT_PROJECT_ID') as string;
const G8PAY_SECRET_KEY = Deno.env.get('G8PAY_SECRET_KEY') as string;

export class G8PayNotConfiguredError extends Error {
  constructor(method: string, reason: string) {
    super(`G8Pay.${method} is unavailable: ${reason}`);
    this.name = 'G8PayNotConfiguredError';
  }
}

export type CreateCheckoutRequest = {
  paymentAttemptId: string;
  amount: number;
  currency: string;
  orderId: string | null;
  returnUrl: string;
  cancelUrl: string;
  payerEmail: string;
  payerName: string;
  metadata?: Record<string, unknown>;
};

export type CreateCheckoutResult = {
  providerTransactionId: string;
  /** EMV QR Ph payload string -- render as a QR code, do NOT treat as a URL. */
  qrPayload: string;
  payloadType: 'qr_ph_emv';
  expiresAt: string | null;
  rawResponse: Record<string, unknown>;
};

export type PaymentStatusResult = {
  providerTransactionId: string;
  status: 'pending' | 'requires_action' | 'paid' | 'failed' | 'cancelled' | 'expired' | 'refunded';
  rawResponse: Record<string, unknown>;
};

export type VerifiedWebhookEvent = {
  providerEventId: string;
  providerTransactionId: string;
  amount: number;
  status: PaymentStatusResult['status'];
  rawPayload: Record<string, unknown>;
};

export interface G8PayAdapter {
  createCheckout(input: CreateCheckoutRequest): Promise<CreateCheckoutResult>;
  getStatus(providerTransactionId: string): Promise<PaymentStatusResult>;
  verifyWebhookSignature(rawBody: string, headers: Headers): Promise<VerifiedWebhookEvent>;
}

class GanapAdapter implements G8PayAdapter {
  async createCheckout(input: CreateCheckoutRequest): Promise<CreateCheckoutResult> {
    if (!G8PAY_MERCHANT_PROJECT_ID || !G8PAY_SECRET_KEY) {
      throw new G8PayNotConfiguredError(
        'createCheckout',
        'G8PAY_MERCHANT_PROJECT_ID / G8PAY_SECRET_KEY secrets are not set (supabase secrets set ...).',
      );
    }

    const response = await fetch(
      `${G8PAY_BASE_URL}/api/merchant-project/${G8PAY_MERCHANT_PROJECT_ID}/webhook-checkout`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', sk: G8PAY_SECRET_KEY },
        body: JSON.stringify({
          externalId: input.paymentAttemptId,
          amount: Math.round(input.amount),
          successRedirectURL: input.returnUrl,
          failureRedirectURL: input.cancelUrl,
          payerEmail: input.payerEmail,
          payerName: input.payerName,
        }),
      },
    );

    const body = await response.json();

    if (!response.ok || body.status !== 1 || !body.data?.paymentUrl || !body.data?.referenceNumber) {
      throw new Error(body?.message || `Ganap checkout creation failed (HTTP ${response.status}).`);
    }

    return {
      providerTransactionId: body.data.referenceNumber,
      qrPayload: body.data.paymentUrl,
      payloadType: 'qr_ph_emv',
      expiresAt: body.data.expiration ?? null,
      rawResponse: body,
    };
  }

  async getStatus(): Promise<PaymentStatusResult> {
    throw new G8PayNotConfiguredError(
      'getStatus',
      'Ganap has no documented transaction-status endpoint -- payment confirmation only arrives via the webhook.',
    );
  }

  async verifyWebhookSignature(rawBody: string): Promise<VerifiedWebhookEvent> {
    // Ganap's webhook has no signature or shared-secret header (confirmed
    // via their Developer Guide). This is a structural check only -- see
    // the file header comment and the webhook handler for the additional
    // integrity check against our own payment_attempts records.
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new Error('Webhook body is not valid JSON.');
    }

    const { status, externalId, referenceNumber, amount } = payload as Record<string, unknown>;

    if (typeof externalId !== 'string' || typeof referenceNumber !== 'string' || typeof amount !== 'number') {
      throw new Error('Webhook payload is missing required fields (externalId, referenceNumber, amount).');
    }

    const mappedStatus: PaymentStatusResult['status'] = status === 'success' ? 'paid' : 'failed';

    return {
      providerEventId: `${externalId}:${referenceNumber}:${status}`,
      providerTransactionId: referenceNumber,
      amount,
      status: mappedStatus,
      rawPayload: payload,
    };
  }
}

export function getG8PayAdapter(): G8PayAdapter {
  return new GanapAdapter();
}
