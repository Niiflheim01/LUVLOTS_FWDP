import { View, Text, StyleSheet } from 'react-native';

export default function AuctionNotice() {
  return (
    <View style={s.container}>
      <Text style={s.text}>You have won these auction items.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginTop: 8,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#DDF4D8',
    padding: 16,
  },
  text: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#166534',
  },
});
