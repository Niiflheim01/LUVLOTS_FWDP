import { FunctionsHttpError } from '@supabase/supabase-js';

import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';

/**
 * The edge functions return a JSON body like { error: "..." } alongside a
 * non-2xx status (e.g. 422 when the order total is outside the ₱200-₱50,000
 * range G8 Pay accepts). supabase.functions.invoke() only gives us a generic
 * FunctionsHttpError ("Edge Function returned a non-2xx status code") unless
 * we read the response body ourselves.
 */
async function describeFunctionsError(error: unknown, fallback: string): Promise<Error> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      if (body?.error) return new Error(body.error);
    } catch {
      // response body wasn't JSON -- fall through to the generic message
    }
  }
  return error instanceof Error ? error : new Error(fallback);
}

export type CreateG8PayCheckoutInput = {
  orderId: string;
  returnUrl: string;
  cancelUrl: string;
  metadata?: Record<string, unknown>;
};

export type G8PayCheckout = {
  paymentAttemptId: string;
  /** EMV QR Ph payload -- render as a QR code (e.g. react-native-qrcode-svg), not a link. */
  qrPayload: string;
  payloadType: 'qr_ph_emv';
  expiresAt: string | null;
  // Ganap's referenceNumber is deliberately never sent to the client -- see
  // supabase/functions/g8-pay-create-checkout/index.ts.
};

export async function createG8PayCheckout(input: CreateG8PayCheckoutInput): Promise<G8PayCheckout> {
  if (!env.enableG8Pay) {
    throw new Error('G8 Pay is not enabled. Configure the server-side G8 Pay Edge Functions first.');
  }

  const { data, error } = await supabase.functions.invoke('g8-pay-create-checkout', {
    body: input,
  });

  if (error) throw await describeFunctionsError(error, 'Could not start G8 Pay checkout.');
  if (!data?.qrPayload || !data?.paymentAttemptId) {
    throw new Error(data?.error || 'G8 Pay checkout did not return a usable payment QR code.');
  }

  return data as G8PayCheckout;
}

export async function getG8PayStatus(paymentAttemptId: string) {
  const { data, error } = await supabase.functions.invoke('g8-pay-status', {
    body: { paymentAttemptId },
  });

  if (error) throw await describeFunctionsError(error, 'Could not check G8 Pay payment status.');
  return data;
}
