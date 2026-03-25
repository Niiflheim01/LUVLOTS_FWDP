import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Plus, Minus, Ellipsis } from 'lucide-react-native';

const productImages: Record<string, any> = {
  'retro-jacket.png': require('@/assets/images/retro-jacket.png'),
  'retro-watch.png': require('@/assets/images/retro-watch.png'),
};

type Product = {
  id: string;
  name: string;
  price: number;
  size: string;
  color: string;
  image: string;
  quantity: number;
};

type Props = {
  product: Product;
  onIncrease: () => void;
  onDecrease: () => void;
  onMore: () => void;
};

export default function ProductCard({ product, onIncrease, onDecrease, onMore }: Props) {
  return (
    <View style={s.card}>
      <Image
        source={productImages[product.image]}
        style={s.image}
        resizeMode="cover"
      />
      <View style={s.info}>
        <View>
          <View style={s.nameRow}>
            <Text style={s.name}>{product.name}</Text>
            <Text style={s.price}>₱{product.price.toFixed(2)}</Text>
          </View>
          <Text style={s.details}>
            {product.size} / {product.color}
          </Text>
        </View>

        <View style={s.actionsRow}>
          <View style={s.qtyControl}>
            <Pressable onPress={onDecrease}>
              <Minus stroke="white" size={14} />
            </Pressable>
            <Text style={s.qtyText}>{product.quantity}</Text>
            <Pressable onPress={onIncrease}>
              <Plus stroke="white" size={14} />
            </Pressable>
          </View>

          <Pressable onPress={onMore} style={s.moreBtn}>
            <Ellipsis size={14} color="white" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#000',
  },
  price: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#000',
  },
  details: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#555',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 9999,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtyText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#fff',
  },
  moreBtn: {
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
