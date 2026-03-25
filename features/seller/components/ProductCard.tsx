import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star, Gavel } from 'lucide-react-native';

type Props = {
  title: string;
  price: number;
  image: any;
  rating?: number;
  status?: string;
  onPress?: () => void;
};

export default function ProductCard({
  title,
  price,
  image,
  rating = 5.0,
  status = 'Auctioned Item',
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={s.card}
      activeOpacity={0.9}>
      <Image source={image} style={s.image} resizeMode="cover" />

      <View style={s.infoRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{title}</Text>
          <View style={s.metaRow}>
            <Star size={12} fill="black" stroke="black" />
            <Text style={s.metaText}>{rating.toFixed(1)}</Text>
            <Gavel size={12} stroke="black" style={{ marginLeft: 8 }} />
            <Text style={s.metaText}>{status}</Text>
          </View>
        </View>

        <Text style={s.price}>${price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE7F5',
    backgroundColor: '#fff',
    padding: 8,
  },
  image: {
    width: '100%',
    height: 144,
    borderRadius: 10,
  },
  infoRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#000',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#666',
  },
  price: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#000',
  },
});
