import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import ProductCard from '@/components/ProductCard';

type Filter = 'All' | 'To Ship' | 'Received';

const PURCHASE_HISTORY = [
  {
    date: 'July 9, 2025',
    items: [
      {
        name: 'Signature Sneakers',
        price: '120.00',
        status: 'toShip' as const,
        imageUri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80',
        sellerId: '3',
        description: 'Limited collab sneakers hand-signed.',
        category: 'Footwear',
      },
    ],
  },
  {
    date: 'July 8, 2025',
    items: [
      {
        name: 'Vintage Sunglasses',
        price: '45.00',
        status: 'received' as const,
        imageUri: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&q=80',
        sellerId: '7',
        description: 'Vintage-style sunglasses from celebrity wardrobe.',
        category: 'Accessories',
      },
      {
        name: 'Designer Perfume',
        price: '95.00',
        status: 'received' as const,
        imageUri: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=200&q=80',
        sellerId: '6',
        description: 'Limited edition designer fragrance.',
        category: 'Beauty',
      },
    ],
  },
  {
    date: 'June 30, 2025',
    items: [
      {
        name: 'Travel Backpack',
        price: '175.00',
        status: 'received' as const,
        imageUri: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&q=80',
        sellerId: '6',
        description: 'Premium travel backpack, lightly used.',
        category: 'Bags',
      },
    ],
  },
];

const FILTERS: Filter[] = ['All', 'To Ship', 'Received'];

export default function PurchaseHistory() {
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = PURCHASE_HISTORY.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (filter === 'All') return true;
      if (filter === 'To Ship') return item.status === 'toShip';
      if (filter === 'Received') return item.status === 'received';
      return true;
    }),
  })).filter((group) => group.items.length > 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      {/* Filter Tabs */}
      <View style={ph.filterBar}>
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[ph.filterChip, filter === f && ph.filterChipActive]}>
            <Text style={[ph.filterChipText, filter === f && ph.filterChipTextActive]}>
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <ShoppingBag size={56} color="#CCC" />
            <Text style={ph.emptyText}>No purchases in this category</Text>
          </View>
        ) : (
          filtered.map((group, i) => (
            <View key={i} style={ph.card}>
              <View style={ph.headerRow}>
                <Text style={ph.dateText}>{group.date}</Text>
                <Text style={ph.countText}>{group.items.length} item{group.items.length > 1 ? 's' : ''}</Text>
              </View>
              {group.items.map((item, j) => (
                <ProductCard
                  key={j}
                  name={item.name}
                  price={item.price}
                  status={item.status}
                  imageUri={item.imageUri}
                  sellerId={item.sellerId}
                  description={item.description}
                  category={item.category}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const ph = StyleSheet.create({
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F5F8FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#4289AB',
    borderColor: '#4289AB',
  },
  filterChipText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#666',
  },
  filterChipTextActive: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1F2937' },
  countText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
});
