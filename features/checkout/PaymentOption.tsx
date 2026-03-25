import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ChevronRight, CheckCircle2 } from 'lucide-react-native';
import OptionList from './OptionList';

type Props = {
  title: string;
  subtitle: string;
  icon: string;
  selected?: boolean;
  expanded?: boolean;
  nestedOptions?: { id: string; title: string; subtitle?: string }[];
  onPress?: () => void;
};

export default function PaymentOption({
  title,
  subtitle,
  selected,
  expanded,
  nestedOptions,
  onPress,
}: Props) {
  return (
    <View style={[styles.container, selected && styles.containerSelected]}>
      <TouchableOpacity onPress={onPress} style={styles.optionRow} activeOpacity={0.75}>
        <View style={styles.textBlock}>
          <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
          <Text style={[styles.subtitle, selected && styles.subtitleSelected]}>{subtitle}</Text>
        </View>
        {selected ? (
          <CheckCircle2 size={22} color="#4289AB" fill="#EFF6FA" />
        ) : (
          <ChevronRight size={20} color="#C0C9D0" />
        )}
      </TouchableOpacity>

      {expanded && nestedOptions && (
        <View style={styles.nestedWrap}>
          <OptionList options={nestedOptions} selectedParent={title} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8EFF4',
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  containerSelected: {
    borderColor: '#4289AB',
    backgroundColor: '#F0F8FC',
    shadowColor: '#4289AB',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  textBlock: { flex: 1, marginRight: 12 },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#1A2C3D',
  },
  titleSelected: { color: '#2C6F91' },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#8A9BAA',
    marginTop: 2,
  },
  subtitleSelected: { color: '#4289AB' },
  nestedWrap: {
    borderTopWidth: 1,
    borderTopColor: '#E8EFF4',
    paddingBottom: 4,
  },
});
