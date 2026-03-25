import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy } from 'lucide-react-native';
import ProductCard from '@/components/ProductCard';

const WINNINGS = [
  {
    date: 'July 9, 2025',
    items: [
      {
        name: 'Vintage Leather Jacket',
        price: '90.00',
        status: 'won' as const,
        imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&q=80',
        sellerId: '1',
        description: 'Classic leather jacket, authenticated and pre-loved.',
        category: 'Fashion',
      },
    ],
  },
  {
    date: 'July 5, 2025',
    items: [
      {
        name: 'Silk Evening Gown',
        price: '280.00',
        status: 'won' as const,
        imageUri: 'https://images.unsplash.com/photo-1484327973588-c31f829103fe?w=200&q=80',
        sellerId: '5',
        description: 'Worn at the 2023 awards. Authenticated.',
        category: 'Fashion',
      },
      {
        name: 'Da Vinci Timepiece',
        price: '21.00',
        status: 'won' as const,
        imageUri: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80',
        sellerId: '1',
        description: 'Rare vintage watch with original leather strap.',
        category: 'Accessories',
      },
      {
        name: 'Luxury Handbag',
        price: '350.00',
        status: 'won' as const,
        imageUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80',
        sellerId: '5',
        description: 'Authentic designer handbag.',
        category: 'Fashion',
      },
    ],
  },
];

export default function Winnings() {
  const totalWon = WINNINGS.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      {/* Stats Banner */}
      <View style={wn.statsBanner}>
        <View style={wn.statItem}>
          <Trophy size={20} color="#D9AC4E" />
          <Text style={wn.statNum}>{totalWon}</Text>
          <Text style={wn.statLabel}>Total Wins</Text>
        </View>
        <View style={wn.statDivider} />
        <View style={wn.statItem}>
          <Text style={wn.statNum}>₱741.00</Text>
          <Text style={wn.statLabel}>Total Value</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}>
        {WINNINGS.map((group, i) => (
          <View key={i} style={wn.card}>
            <View style={wn.dateRow}>
              <Trophy size={13} color="#D9AC4E" />
              <Text style={wn.dateText}>{group.date}</Text>
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
        ))}
      </ScrollView>
    </View>
  );
}

const wn = StyleSheet.create({
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#4289AB',
    paddingVertical: 16,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 40,
  },
  statItem: { alignItems: 'center', gap: 4 },
  statNum: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' },
  statLabel: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
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
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1F2937' },
});
