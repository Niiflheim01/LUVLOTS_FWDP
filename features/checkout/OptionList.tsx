import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

type Option = {
  id: string;
  title: string;
  subtitle?: string;
};

export default function OptionList({
  options,
}: {
  options: Option[];
  selectedParent: string;
}) {
  return (
    <View style={styles.container}>
      {options.map((opt, index) => (
        <TouchableOpacity
          key={opt.id}
          activeOpacity={0.7}
          style={[styles.optionItem, index === options.length - 1 && { borderBottomWidth: 0 }]}>
          <View style={styles.radio} />
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>{opt.title}</Text>
            {opt.subtitle ? <Text style={styles.optionSubtitle}>{opt.subtitle}</Text> : null}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFF4F7',
    gap: 12,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4289AB',
    backgroundColor: '#fff',
  },
  optionTitle: {
    color: '#1A2C3D',
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
  },
  optionSubtitle: {
    fontSize: 11,
    color: '#8A9BAA',
    fontFamily: 'Poppins_400Regular',
    marginTop: 1,
  },
});
