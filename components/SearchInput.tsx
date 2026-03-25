import { Search } from 'lucide-react-native';
import { TextInput, View, StyleSheet } from 'react-native';

export default function SearchInput({
  filterText,
  onFilterTextChange,
}: {
  filterText: string;
  onFilterTextChange: Function;
}) {
  return (
    <View style={s.container}>
      <Search size={16} color="#666" />
      <TextInput
        placeholder="Search"
        value={filterText}
        onChangeText={(text) => onFilterTextChange(text)}
        style={s.input}
        placeholderTextColor="#999"
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#333',
    paddingVertical: 10,
  },
});
