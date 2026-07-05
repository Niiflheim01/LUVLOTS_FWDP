import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import QRCode from 'react-native-qrcode-svg';
import { X } from 'lucide-react-native';

import { useAuth } from '@/lib/auth-context';
import { createG8PayCheckout, getG8PayStatus } from '@/lib/payments/g8pay';
import { logError } from '@/lib/observability';
import { env } from '@/lib/env';

const POLL_INTERVAL_MS = 4000;

type Props = {
  visible: boolean;
  orderId: string;
  amount: number;
  currency?: string;
  /** Which QR Ph wallet the buyer picked (GCash / Maya / QR Ph) -- purely
   * cosmetic, since G8 Pay/Ganap always returns the same universal QR Ph
   * EMV payload regardless of which app scans it. */
  providerLabel?: string;
  onClose: () => void;
  onPaid: () => void;
};

type Phase = 'idle' | 'creating' | 'awaiting_scan' | 'checking' | 'paid' | 'error';

export default function GCashPaymentModal({ visible, orderId, amount, currency = 'PHP', providerLabel = 'GCash', onClose, onPaid }: Props) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('idle');
  const [qrPayload, setQrPayload] = useState<string | null>(null);
  const [paymentAttemptId, setPaymentAttemptId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [notYetPaidNotice, setNotYetPaidNotice] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) {
      stopPolling();
      setPhase('idle');
      setQrPayload(null);
      setPaymentAttemptId(null);
      setErrorMessage(null);
      setNotYetPaidNotice(false);
      return;
    }

    if (!user) {
      setPhase('error');
      setErrorMessage('Please sign in to pay with GCash.');
      return;
    }

    if (!orderId) {
      setPhase('error');
      setErrorMessage('No order was created for this checkout, so there is nothing for G8 Pay to charge against.');
      return;
    }

    startCheckout();
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  async function startCheckout() {
    setPhase('creating');
    setErrorMessage(null);
    try {
      const checkout = await createG8PayCheckout({
        orderId,
        returnUrl: `${env.appUrl}checkout/success`,
        cancelUrl: `${env.appUrl}checkout`,
      });
      setQrPayload(checkout.qrPayload);
      setPaymentAttemptId(checkout.paymentAttemptId);
      setPhase('awaiting_scan');
      beginPolling(checkout.paymentAttemptId);
    } catch (error) {
      logError(error, { area: 'GCashPaymentModal.startCheckout' });
      setPhase('error');
      setErrorMessage(error instanceof Error ? error.message : 'Could not start G8 Pay checkout.');
    }
  }

  function beginPolling(attemptId: string) {
    stopPolling();
    pollRef.current = setInterval(() => checkStatus(attemptId), POLL_INTERVAL_MS);
  }

  async function checkStatus(attemptId: string) {
    try {
      const attempt = await getG8PayStatus(attemptId);
      if (attempt.status === 'paid') {
        stopPolling();
        setNotYetPaidNotice(false);
        setPhase('paid');
        onPaid();
        return true;
      }
      if (['failed', 'cancelled', 'expired'].includes(attempt.status)) {
        stopPolling();
        setPhase('error');
        setErrorMessage(`Payment ${attempt.status}. Please try again.`);
        return true;
      }
      return false;
    } catch (error) {
      logError(error, { area: 'GCashPaymentModal.checkStatus' });
      return false;
    }
  }

  async function handleManualCheck() {
    if (!paymentAttemptId) return;
    setPhase('checking');
    setNotYetPaidNotice(false);
    const resolved = await checkStatus(paymentAttemptId);
    if (!resolved) {
      // Still pending -- tell the buyer explicitly instead of silently
      // dropping them back on the same QR code with no feedback.
      setNotYetPaidNotice(true);
      setPhase('awaiting_scan');
    }
  }

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} style={styles.modal}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Pay with {providerLabel}</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <X size={22} color="#666" />
          </Pressable>
        </View>

        {phase === 'creating' && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#4289AB" />
            <Text style={styles.helperText}>Creating your G8 Pay checkout...</Text>
          </View>
        )}

        {phase === 'awaiting_scan' && qrPayload && (
          <View style={styles.center}>
            <View style={styles.qrWrap}>
              <QRCode value={qrPayload} size={220} />
            </View>
            <Text style={styles.amountText}>{currency} {amount.toLocaleString()}</Text>
            <Text style={styles.helperText}>
              Open {providerLabel} (or any QR Ph-compatible app), scan this code, and complete the payment.
            </Text>
            {notYetPaidNotice ? (
              <Text style={styles.pendingNoticeText}>
                We haven't received your payment yet. It's checked automatically every few seconds — if you've
                already paid, this can take a moment to confirm.
              </Text>
            ) : null}
            <Pressable onPress={handleManualCheck} style={styles.checkBtn}>
              <Text style={styles.checkBtnText}>I've paid — check now</Text>
            </Pressable>
          </View>
        )}

        {phase === 'checking' && (
          <View style={styles.center}>
            <ActivityIndicator size="small" color="#4289AB" />
            <Text style={styles.helperText}>Checking payment status...</Text>
          </View>
        )}

        {phase === 'paid' && (
          <View style={styles.center}>
            <Text style={styles.helperText}>Payment confirmed!</Text>
          </View>
        )}

        {phase === 'error' && (
          <View style={styles.center}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            {orderId && user ? (
              <Pressable onPress={startCheckout} style={styles.checkBtn}>
                <Text style={styles.checkBtnText}>Retry</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { justifyContent: 'flex-end', margin: 0 },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 320,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    color: '#1A2C3D',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  qrWrap: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  amountText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#1A2C3D',
    marginTop: 8,
  },
  helperText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  pendingNoticeText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFFBEB',
    paddingVertical: 8,
    borderRadius: 8,
  },
  checkBtn: {
    marginTop: 8,
    backgroundColor: '#4289AB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  checkBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#fff',
  },
});
