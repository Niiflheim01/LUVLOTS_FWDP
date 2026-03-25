import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Switch, StyleSheet,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Gavel, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SlideModal from '@/components/SlideModal';

type PlaceBidModalProps = {
  isVisible: boolean;
  onClose: () => void;
  currentBid?: number;
  minIncrement?: number;
  timeLeft?: string;
  itemName?: string;
};

const QUICK_INCREMENTS = [500, 1000, 2000, 5000];

export default function PlaceBidModal({
  isVisible,
  onClose,
  currentBid = 9500,
  minIncrement = 500,
  timeLeft = '4h 20m 10s',
  itemName,
}: PlaceBidModalProps) {
  const [autoBid, setAutoBid] = useState(false);
  const [selectedIncrement, setSelectedIncrement] = useState<number | null>(500);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const minNextBid = currentBid + minIncrement;

  const yourBid = isCustom
    ? (parseInt(customAmount.replace(/[^0-9]/g, ''), 10) || 0)
    : currentBid + (selectedIncrement ?? 0);

  const isValid = yourBid >= minNextBid;

  function handleSelectIncrement(amt: number) {
    setSelectedIncrement(amt);
    setIsCustom(false);
    setCustomAmount('');
  }

  function handleCustomFocus() {
    setIsCustom(true);
    setSelectedIncrement(null);
  }

  function handleConfirm() {
    if (!isValid) {
      Alert.alert('Bid Too Low', `Minimum bid is ₱${minNextBid.toLocaleString()}`);
      return;
    }
    onClose();
    Alert.alert(
      'Bid Placed! 🎉',
      `Your bid of ₱${yourBid.toLocaleString()} has been submitted.`,
      [{ text: 'OK' }]
    );
  }

  return (
    <SlideModal isVisible={isVisible} onClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.title}>Place a Bid</Text>
            {itemName && <Text style={s.itemName} numberOfLines={1}>{itemName}</Text>}
          </View>
          <View style={s.timePill}>
            <Clock size={12} color="#4289AB" />
            <Text style={s.timeText}>{timeLeft}</Text>
          </View>
        </View>

        {/* Current bid */}
        <View style={s.currentBidRow}>
          <View>
            <Text style={s.currentBidLabel}>Current Bid</Text>
            <Text style={s.currentBidAmt}>₱{currentBid.toLocaleString()}</Text>
          </View>
          <View style={s.minBidPill}>
            <Gavel size={11} color="#D9AC4E" />
            <Text style={s.minBidText}>Min +₱{minIncrement.toLocaleString()}</Text>
          </View>
        </View>

        {/* Auto bid */}
        <View style={s.autoBidRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.autoBidLabel}>Auto Bid</Text>
            <Text style={s.autoBidSub}>Automatically outbid others up to your max</Text>
          </View>
          <Switch value={autoBid} onValueChange={setAutoBid} trackColor={{ true: '#4289AB', false: '#ddd' }} thumbColor="#fff" />
        </View>

        {/* Quick increment chips */}
        <Text style={s.chipsLabel}>Quick add</Text>
        <View style={s.chipsRow}>
          {QUICK_INCREMENTS.map((amt) => {
            const active = !isCustom && selectedIncrement === amt;
            return (
              <TouchableOpacity
                key={amt}
                onPress={() => handleSelectIncrement(amt)}
                style={[s.chip, active && s.chipActive]}>
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  +₱{amt >= 1000 ? `${amt / 1000}K` : amt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom input */}
        <View style={[s.customInputWrap, isCustom && s.customInputWrapActive]}>
          <Text style={s.currencySymbol}>₱</Text>
          <TextInput
            value={customAmount}
            onChangeText={setCustomAmount}
            onFocus={handleCustomFocus}
            placeholder={`Custom amount (min ₱${minNextBid.toLocaleString()})`}
            placeholderTextColor="#BCBCBC"
            keyboardType="numeric"
            style={s.customInput}
          />
        </View>

        {/* Your bid display */}
        <View style={s.yourBidRow}>
          <Text style={s.yourBidLabel}>Your bid</Text>
          <Text style={[s.yourBidAmt, !isValid && yourBid > 0 && { color: '#E53935' }]}>
            ₱{yourBid > 0 ? yourBid.toLocaleString() : '—'}
          </Text>
        </View>
        {yourBid > 0 && !isValid && (
          <Text style={s.errorText}>Must be at least ₱{minNextBid.toLocaleString()}</Text>
        )}

        {/* Confirm button */}
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!isValid}
          style={[s.placeBtn, !isValid && { opacity: 0.5 }]}>
          <LinearGradient
            colors={['#4289AB', '#2C6F91']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.placeBtnGrad}>
            <Gavel size={16} color="#fff" />
            <Text style={s.placeBtnText}>
              Confirm Bid{isValid ? ` — ₱${yourBid.toLocaleString()}` : ''}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SlideModal>
  );
}

const s = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#1A2C3D' },
  itemName: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 2, maxWidth: 220 },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EBF5FB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  timeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#4289AB' },

  currentBidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FBFD',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E4ECF1',
  },
  currentBidLabel: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF' },
  currentBidAmt: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: '#1A2C3D', marginTop: 2 },
  minBidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(217,172,78,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  minBidText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#D9AC4E' },

  autoBidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FBFD',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E4ECF1',
  },
  autoBidLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1A2C3D' },
  autoBidSub: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  chipsLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#6B7280', marginBottom: 8 },
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#EBF5FB',
    borderColor: '#4289AB',
  },
  chipText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#6B7280' },
  chipTextActive: { color: '#4289AB' },

  customInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: '#FAFAFA',
    marginBottom: 14,
  },
  customInputWrapActive: { borderColor: '#4289AB', backgroundColor: '#F8FBFD' },
  currencySymbol: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#9CA3AF', marginRight: 6 },
  customInput: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#1A2C3D' },

  yourBidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  yourBidLabel: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6B7280' },
  yourBidAmt: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: '#1A2C3D' },
  errorText: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#E53935', textAlign: 'right', marginBottom: 8 },

  placeBtn: { marginTop: 16, borderRadius: 14, overflow: 'hidden' },
  placeBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  placeBtnText: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#fff' },
});
