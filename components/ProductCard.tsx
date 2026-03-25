import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

type Variant = 'toShip' | 'received' | 'upcoming' | 'won';

interface ProductCardProps {
  name: string;
  price: string;
  status: Variant;
  imageUri?: string;
  sellerId?: string;
  description?: string;
  category?: string;
}

const STATUS_MAP: Record<Variant, { bg: string; textColor: string; label: string }> = {
  toShip: { bg: '#EFF6FA', textColor: '#4289AB', label: 'To Ship' },
  received: { bg: '#DCFCE7', textColor: '#16A34A', label: 'Received' },
  upcoming: { bg: '#FEF3C7', textColor: '#D97706', label: 'Upcoming' },
  won: { bg: '#FFF3E0', textColor: '#E65100', label: 'You Won' },
};

export default function ProductCard({ name, price, status, imageUri, sellerId, description, category }: ProductCardProps) {
  const badge = STATUS_MAP[status];

  function handlePress() {
    if (imageUri) {
      router.push({
        pathname: '/(main)/ProductScreen',
        params: {
          id: Math.random().toString(),
          name,
          price: `₱${price}`,
          imageUri,
          rating: '4.8',
          sold: '0',
          seller: 'Seller',
          sellerId: sellerId ?? '1',
          description: description ?? '',
          category: category ?? 'Fashion',
        },
      } as any);
    }
  }

  return (
    <Pressable onPress={handlePress} style={s.card}>
      <Image
        source={{ uri: imageUri ?? 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&q=80' }}
        style={s.image}
        resizeMode="cover"
      />
      <View style={s.infoRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.name} numberOfLines={1}>{name}</Text>
          <Text style={s.subtitle}>Auctioned Item</Text>
        </View>
        <View style={s.rightCol}>
          <Text style={s.price}>₱{price}</Text>
          <View style={[s.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[s.statusText, { color: badge.textColor }]}>{badge.label}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    padding: 10,
    marginTop: 10,
    backgroundColor: '#FAFAFA',
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  infoRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1A1A2E',
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  price: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#EE4D2D',
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
  },
});
