import { View, Text, StyleSheet } from 'react-native';

type Props = {
  total: number;
};

export default function PaymentSummary({ total }: Props) {
  return (
    <View style={s.container}>
      <Text style={s.title}>Detailed Payment</Text>
      <View style={s.divider} />
      <View style={s.row}>
        <Text style={s.label}>Price Estimation</Text>
        <Text style={s.value}>₱{total.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#000',
  },
  divider: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.5)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#000',
  },
  value: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#000',
  },
});
