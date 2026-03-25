import React, { useState } from 'react';
import { View, Text, SafeAreaView, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type PaymentOption = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const paymentOptions: PaymentOption[] = [
  {
    id: '1',
    title: 'Cash On Delivery',
    subtitle: 'Indicate address',
    icon: 'cash-outline',
  },
  {
    id: '2',
    title: 'Credit/Debit Card',
    subtitle: 'Click to see options.',
    icon: 'card-outline',
  },
  {
    id: '3',
    title: 'Online Payment',
    subtitle: 'Click to see options.',
    icon: 'laptop-outline',
  },
  {
    id: '4',
    title: 'International Payment',
    subtitle: 'Click to see options.',
    icon: 'globe-outline',
  },
];

type PaymentOptionCardProps = {
  option: PaymentOption;
  isSelected: boolean;
  onPress: () => void;
};

const PaymentOptionCard: React.FC<PaymentOptionCardProps> = ({ option, isSelected, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[
      co.optionCard,
      isSelected ? { borderWidth: 1, borderColor: '#000' } : undefined,
    ]}>
    <View style={co.optionLeft}>
      <View style={co.iconWrap}>
        <Ionicons name={option.icon} size={24} color="black" />
      </View>
      <View>
        <Text style={co.optionTitle}>{option.title}</Text>
        <Text style={co.optionSub}>{option.subtitle}</Text>
      </View>
    </View>

    {isSelected ? (
      <Ionicons name="checkmark-circle" size={22} color="black" />
    ) : (
      <Ionicons name="ellipse-outline" size={22} color="gray" />
    )}
  </Pressable>
);

export default function CheckoutScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <SafeAreaView style={co.container}>
      {/* Header */}
      <View style={co.header}>
        <Pressable style={co.backBtn}>
          <Ionicons name="chevron-back" size={20} color="white" />
        </Pressable>
        <Text style={co.headerTitle}>Checkout</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Progress Steps */}
      <View style={co.stepsRow}>
        <Ionicons name="checkmark-circle" size={22} color="black" />
        <View style={co.stepLine} />
        <Ionicons name="ellipse-outline" size={22} color="gray" />
        <View style={co.stepLine} />
        <Ionicons name="ellipse-outline" size={22} color="gray" />
        <View style={co.stepLine} />
        <Ionicons name="ellipse-outline" size={22} color="gray" />
      </View>

      {/* Step Labels */}
      <View style={co.stepLabels}>
        <Text style={co.stepLabelActive}>Payment Method</Text>
        <Text style={co.stepLabelInactive}>Add Donation</Text>
        <Text style={co.stepLabelInactive}>Payment Details</Text>
        <Text style={co.stepLabelInactive}>Confirmation</Text>
      </View>

      {/* Payment Options */}
      <ScrollView style={{ marginTop: 24 }}>
        {paymentOptions.map((opt) => (
          <PaymentOptionCard
            key={opt.id}
            option={opt}
            isSelected={selected === opt.id}
            onPress={() => setSelected(opt.id)}
          />
        ))}
      </ScrollView>

      {/* Next Button */}
      <Pressable style={co.nextBtn}>
        <Text style={co.nextBtnText}>Next</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const co = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#8abdd8', paddingHorizontal: 16 },
  header: { marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { borderRadius: 8, backgroundColor: '#000', padding: 8 },
  headerTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 20 },
  stepsRow: { marginTop: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  stepLine: { flex: 1, height: 1, backgroundColor: '#000', marginHorizontal: 4 },
  stepLabels: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  stepLabelActive: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#000' },
  stepLabelInactive: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#4B5563' },
  optionCard: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { marginRight: 12, borderRadius: 12, backgroundColor: '#F3F4F6', padding: 12 },
  optionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
  optionSub: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6B7280' },
  nextBtn: {
    marginBottom: 24,
    marginTop: 16,
    alignItems: 'center',
    borderRadius: 9999,
    backgroundColor: '#fff',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  nextBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 15 },
});
