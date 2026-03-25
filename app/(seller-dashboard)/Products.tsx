import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  TextInput,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Search,
  Plus,
  Package,
  Eye,
  Pencil,
  Trash2,
  Radio,
  Gavel,
  Filter,
  MoreVertical,
  ArrowUpDown,
  Heart,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');

type FilterKey = 'all' | 'active' | 'sold-out' | 'unlisted' | 'auction' | 'live';

const FILTERS: { key: FilterKey; label: string; count: number }[] = [
  { key: 'all', label: 'All', count: 24 },
  { key: 'active', label: 'Active', count: 18 },
  { key: 'sold-out', label: 'Sold Out', count: 3 },
  { key: 'unlisted', label: 'Unlisted', count: 2 },
  { key: 'auction', label: 'Auction', count: 4 },
  { key: 'live', label: 'Live', count: 1 },
];

const PRODUCTS = [
  {
    id: 'p1',
    name: 'Signed Tour Jacket 2023',
    sku: 'SKU-TJ2023',
    price: 4500,
    originalPrice: 6000,
    sold: 12,
    stock: 3,
    views: 1240,
    imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&q=80',
    status: 'active' as const,
    isLive: false,
    isAuction: true,
    rating: 4.9,
    reviews: 8,
    charity: { name: 'Philippine Red Cross', percent: 10 },
  },
  {
    id: 'p2',
    name: 'Vintage Vinyl Record Collection',
    sku: 'SKU-VRC01',
    price: 2800,
    originalPrice: null,
    sold: 25,
    stock: 5,
    views: 3420,
    imageUri: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=200&q=80',
    status: 'active' as const,
    isLive: false,
    isAuction: false,
    rating: 4.8,
    reviews: 15,
    charity: null,
  },
  {
    id: 'p3',
    name: 'Celebrity Sunglasses',
    sku: 'SKU-CS01',
    price: 3500,
    originalPrice: 5000,
    sold: 8,
    stock: 0,
    views: 890,
    imageUri: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&q=80',
    status: 'sold-out' as const,
    isLive: false,
    isAuction: false,
    rating: 5.0,
    reviews: 6,
    charity: { name: 'UNICEF Philippines', percent: 15 },
  },
  {
    id: 'p4',
    name: 'Handcrafted Leather Bag',
    sku: 'SKU-HLB01',
    price: 12000,
    originalPrice: null,
    sold: 3,
    stock: 1,
    views: 2100,
    imageUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80',
    status: 'active' as const,
    isLive: true,
    isAuction: true,
    rating: 4.7,
    reviews: 3,
    charity: { name: 'WWF Philippines', percent: 5 },
  },
  {
    id: 'p5',
    name: 'Signed Concert Poster',
    sku: 'SKU-SCP01',
    price: 1500,
    originalPrice: 2000,
    sold: 30,
    stock: 10,
    views: 5600,
    imageUri: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=200&q=80',
    status: 'active' as const,
    isLive: false,
    isAuction: false,
    rating: 4.6,
    reviews: 22,
    charity: null,
  },
  {
    id: 'p6',
    name: 'Limited Edition Sneakers',
    sku: 'SKU-LES01',
    price: 8500,
    originalPrice: null,
    sold: 0,
    stock: 2,
    views: 320,
    imageUri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80',
    status: 'unlisted' as const,
    isLive: false,
    isAuction: false,
    rating: 0,
    reviews: 0,
    charity: { name: 'Gawad Kalinga', percent: 20 },
  },
];

function getStatusInfo(status: string) {
  switch (status) {
    case 'active':
      return { label: 'Active', color: '#10B981', bg: '#10B98118' };
    case 'sold-out':
      return { label: 'Sold Out', color: '#EF4444', bg: '#EF444418' };
    case 'unlisted':
      return { label: 'Unlisted', color: '#9CA3AF', bg: '#9CA3AF18' };
    default:
      return { label: status, color: '#6B7280', bg: '#6B728018' };
  }
}

export default function Products() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = PRODUCTS.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'live') return p.isLive;
    if (activeFilter === 'auction') return p.isAuction;
    return p.status === activeFilter;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      {/* Header */}
      <LinearGradient colors={['#1A365D', '#2C5F8A']} style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.headerRow}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <ChevronLeft size={22} color="#fff" />
            </Pressable>
            <Text style={s.headerTitle}>My Products</Text>
            <Pressable style={s.addBtn} onPress={() => router.push('/(seller-dashboard)/AddProduct')}>
              <Plus size={18} color="#fff" />
              <Text style={s.addBtnText}>Add</Text>
            </Pressable>
          </View>

          {/* Search */}
          <View style={s.searchWrap}>
            <Search size={16} color="#9CA3AF" />
            <TextInput
              style={s.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Pressable style={s.filterBtn}>
              <Filter size={16} color="#4289AB" />
            </Pressable>
          </View>

          {/* Summary stats */}
          <View style={s.summaryRow}>
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>24</Text>
              <Text style={s.summaryLabel}>Total</Text>
            </View>
            <View style={s.summaryDot} />
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>18</Text>
              <Text style={s.summaryLabel}>Active</Text>
            </View>
            <View style={s.summaryDot} />
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>78</Text>
              <Text style={s.summaryLabel}>Total Sold</Text>
            </View>
            <View style={s.summaryDot} />
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>₱134K</Text>
              <Text style={s.summaryLabel}>Revenue</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setActiveFilter(f.key)}
            style={[s.filterPill, activeFilter === f.key && s.filterPillActive]}>
            <Text style={[s.filterPillText, activeFilter === f.key && s.filterPillTextActive]}>
              {f.label}
            </Text>
            <View style={[s.filterCount, activeFilter === f.key && s.filterCountActive]}>
              <Text style={[s.filterCountText, activeFilter === f.key && s.filterCountTextActive]}>
                {f.count}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Sort bar */}
      <View style={s.sortBar}>
        <Text style={s.resultCount}>{filtered.length} products</Text>
        <Pressable style={s.sortBtn}>
          <ArrowUpDown size={13} color="#4289AB" />
          <Text style={s.sortBtnText}>Sort by: Newest</Text>
        </Pressable>
      </View>

      {/* Product list */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {filtered.map((product, idx) => {
          const statusInfo = getStatusInfo(product.status);
          return (
            <Animated.View key={product.id} entering={FadeInDown.delay(idx * 60).duration(400)}>
              <View style={s.productCard}>
                <View style={s.productRow}>
                  <View style={{ position: 'relative' }}>
                    <Image source={{ uri: product.imageUri }} style={s.productImage} />
                    {product.isLive && (
                      <View style={s.liveBadge}>
                        <Radio size={8} color="#fff" />
                        <Text style={s.liveText}>LIVE</Text>
                      </View>
                    )}
                    {product.isAuction && !product.isLive && (
                      <View style={s.auctionBadge}>
                        <Gavel size={8} color="#D9AC4E" />
                      </View>
                    )}
                  </View>

                  <View style={s.productInfo}>
                    <Text style={s.productName} numberOfLines={1}>{product.name}</Text>
                    <Text style={s.productSku}>{product.sku}</Text>
                    <View style={s.priceRow}>
                      <Text style={s.productPrice}>₱{product.price.toLocaleString()}</Text>
                      {product.originalPrice && (
                        <Text style={s.originalPrice}>₱{product.originalPrice.toLocaleString()}</Text>
                      )}
                    </View>
                    {product.charity && (
                      <View style={s.charityBadge}>
                        <Heart size={9} color="#E53935" fill="#E53935" />
                        <Text style={s.charityBadgeText}>{product.charity.percent}% → {product.charity.name}</Text>
                      </View>
                    )}
                  </View>

                  <View style={s.productMeta}>
                    <View style={[s.statusBadge, { backgroundColor: statusInfo.bg }]}>
                      <Text style={[s.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                    </View>
                    <Pressable style={s.moreBtn}>
                      <MoreVertical size={16} color="#9CA3AF" />
                    </Pressable>
                  </View>
                </View>

                {/* Bottom stats */}
                <View style={s.productStats}>
                  <View style={s.productStat}>
                    <Eye size={12} color="#9CA3AF" />
                    <Text style={s.productStatText}>{product.views.toLocaleString()} views</Text>
                  </View>
                  <View style={s.productStatDot} />
                  <View style={s.productStat}>
                    <Package size={12} color="#9CA3AF" />
                    <Text style={s.productStatText}>{product.sold} sold</Text>
                  </View>
                  <View style={s.productStatDot} />
                  <View style={s.productStat}>
                    <Text style={s.productStatText}>Stock: {product.stock}</Text>
                  </View>
                  <View style={{ flex: 1 }} />
                  <Pressable style={s.editProductBtn}>
                    <Pencil size={12} color="#4289AB" />
                    <Text style={s.editProductText}>Edit</Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* FAB */}
      <Pressable style={s.fab} onPress={() => router.push('/(seller-dashboard)/AddProduct')}>
        <LinearGradient colors={['#4289AB', '#2C5F8A']} style={s.fabGradient}>
          <Plus size={24} color="#fff" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  addBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#fff' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  searchInput: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#333', paddingVertical: 10 },
  filterBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#EFF6FA', alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14, gap: 16 },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#fff' },
  summaryLabel: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  summaryDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.3)' },

  filterRow: { paddingVertical: 12 },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  filterPillActive: { backgroundColor: '#4289AB', borderColor: '#4289AB' },
  filterPillText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#6B7280' },
  filterPillTextActive: { color: '#fff' },
  filterCount: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  filterCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterCountText: { fontFamily: 'Poppins_700Bold', fontSize: 10, color: '#9CA3AF' },
  filterCountTextActive: { color: '#fff' },

  sortBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8 },
  resultCount: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#4289AB' },

  productCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  productRow: { flexDirection: 'row', gap: 12 },
  productImage: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#E5E7EB' },
  liveBadge: { position: 'absolute', top: 4, left: 4, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#E53935', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  liveText: { fontFamily: 'Poppins_700Bold', fontSize: 7, color: '#fff' },
  auctionBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 6, padding: 4 },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1A365D' },
  productSku: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  productPrice: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#4289AB' },
  originalPrice: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#D1D5DB', textDecorationLine: 'line-through' },
  productMeta: { alignItems: 'flex-end', justifyContent: 'space-between' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  moreBtn: { padding: 4 },

  productStats: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', gap: 6 },
  productStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  productStatText: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF' },
  productStatDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#E5E7EB' },
  editProductBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#4289AB20' },
  editProductText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#4289AB' },

  fab: { position: 'absolute', bottom: 24, right: 20, borderRadius: 28, elevation: 8, shadowColor: '#4289AB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },

  charityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, backgroundColor: '#FEF2F2', alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  charityBadgeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 9, color: '#E53935' },
});
