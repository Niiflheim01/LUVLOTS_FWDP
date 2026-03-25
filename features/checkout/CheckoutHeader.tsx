import { View, Text, StyleSheet } from 'react-native';

const STEPS = ['Payment', 'Donation', 'Details', 'Confirm'];

export default function CheckoutHeader({ step }: { step: number; title: string }) {
  return (
    <View style={styles.container}>
      {/* Step bars */}
      <View style={styles.barsRow}>
        {STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              { backgroundColor: index < step ? '#4289AB' : '#E8EFF4' },
            ]}
          />
        ))}
      </View>
      {/* Step labels */}
      <View style={styles.labelsRow}>
        {STEPS.map((label, index) => (
          <Text
            key={index}
            style={[
              styles.stepLabel,
              index < step && styles.stepLabelActive,
            ]}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  barsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 99,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  stepLabel: {
    fontSize: 10,
    color: '#B0BEC5',
    fontFamily: 'Poppins_400Regular',
    flex: 1,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#4289AB',
    fontFamily: 'Poppins_600SemiBold',
  },
});
