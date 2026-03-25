import { Pressable, View, Text, StyleSheet } from 'react-native';

export default function ToggleSellerButton({
  title,
  filter,
  activeFilter,
  onFilterButtonChange,
}: {
  title: string;
  filter: string;
  activeFilter: string;
  onFilterButtonChange: Function;
}) {
  const isActive = activeFilter === filter;
  return (
    <View style={s.container}>
      <Pressable
        onPress={() =>
          onFilterButtonChange({
            filter: filter,
            title: title,
          })
        }>
        <Text style={[s.text, !isActive && { color: 'rgba(0,0,0,0.5)' }]}>{title}</Text>
      </Pressable>
      {isActive && <View style={s.dot} />}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#000',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
    marginTop: 4,
  },
});
