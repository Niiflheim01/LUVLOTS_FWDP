import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';

export type CreateG8PayCheckoutInput = {
  listingId: string;
  sellerId?: string;
  amount: number;
  currency: string;
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
  providerTransactionId?: string;
};

export async function createG8PayCheckout(input: CreateG8PayCheckoutInput): Promise<G8PayCheckout> {
  if (!env.enableG8Pay) {
    throw new Error('G8 Pay is not enabled. Configure the server-side G8 Pay Edge Functions first.');
  }

  const { data, error } = await supabase.functions.invoke('g8-pay-create-checkout', {
    body: input,
  });

  if (error) throw error;
  if (!data?.qrPayload || !data?.paymentAttemptId) {
    throw new Error(data?.error || 'G8 Pay checkout did not return a usable payment QR code.');
  }

  return data as G8PayCheckout;
}

export async function getG8PayStatus(paymentAttemptId: string) {
  const { data, error } = await supabase.functions.invoke('g8-pay-status', {
    body: { paymentAttemptId },
  });

  if (error) throw error;
  return data;
}
