import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import SlideModal from '@/components/SlideModal';

type DonateModalProps = {
  isVisible: boolean;
  onClose: () => void;
};

export default function DonateModal({ isVisible, onClose }: DonateModalProps) {
  const [autoBid, setAutoBid] = useState(false);
  const [selectedBid, setSelectedBid] = useState(100);

  return (
    <SlideModal isVisible={isVisible} onClose={onClose}>
      <View style={s.headerRow}>
        <Text style={s.title}>Donate</Text>
        <Text style={s.timeLabel}>
          Time left: <Text style={s.timeValue}>2h 45m 32s</Text>
        </Text>
      </View>

      <View style={s.autoBidRow}>
        <Text style={s.autoBidLabel}>Auto bid</Text>
        <Switch value={autoBid} onValueChange={setAutoBid} trackColor={{ true: '#4289AB', false: '#ddd' }} />
      </View>

      <View style={s.chipsRow}>
        {[120, 110, 100, 90].map((amount) => (
          <TouchableOpacity
            key={amount}
            onPress={() => setSelectedBid(amount)}
            style={[s.chip, { backgroundColor: selectedBid === amount ? '#000' : '#E5E7EB' }]}>
            <Text style={[s.chipText, { color: selectedBid === amount ? '#fff' : '#000' }]}>
              {amount}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.adjusterRow}>
        <TouchableOpacity
          onPress={() => setSelectedBid((prev) => Math.max(prev - 10, 0))}
          style={s.adjusterBtn}>
          <Minus stroke="white" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={s.bidAmount}>${selectedBid}.00</Text>
          <Text style={s.currentBid}>Current bid: $150.00</Text>
        </View>
        <TouchableOpacity
          onPress={() => setSelectedBid((prev) => prev + 10)}
          style={s.adjusterBtn}>
          <Plus stroke="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={s.placeBtn}>
        <Text style={s.placeBtnText}>Donate</Text>
      </TouchableOpacity>
    </SlideModal>
  );
}

const s = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#000' },
  timeLabel: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6B7280' },
  timeValue: { fontFamily: 'Poppins_600SemiBold', color: '#000' },
  autoBidRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  autoBidLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#000' },
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  chip: { flex: 1, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  chipText: { fontFamily: 'Poppins_700Bold', fontSize: 16 },
  adjusterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  adjusterBtn: { borderRadius: 9999, backgroundColor: '#000', padding: 10, borderWidth: 1, borderColor: '#333' },
  bidAmount: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#000', textAlign: 'center' },
  currentBid: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#6B7280', textAlign: 'center' },
  placeBtn: { width: '100%', borderRadius: 9999, backgroundColor: '#000', paddingVertical: 14 },
  placeBtnText: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#fff', textAlign: 'center' },
});
