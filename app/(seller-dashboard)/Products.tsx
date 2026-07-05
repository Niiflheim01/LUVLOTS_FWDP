import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Plus,
  Package,
  Trash2,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { archiveListing, deleteListing, getMyListings, moveListingToDraft } from '@/lib/listings';
import { logError } from '@/lib/observability';
import type { Listing, ListingStatus } from '@/types/marketplace';

function isEditable(status: ListingStatus) {
  return status === 'draft' || status === 'rejected' || status === 'archived';
}

function getManageAction(status: ListingStatus): { label: string; destructive?: boolean } | null {
  switch (status) {
    case 'draft':
      return { label: 'Delete', destructive: true };
    case 'live':
      return { label: 'Unlist' };
    case 'pending_review':
      return { label: 'Cancel Review' };
    case 'rejected':
    case 'archived':
      return { label: 'Move to Draft' };
    case 'sold':
      return null;
    default:
      return null;
  }
}

type FilterKey = 'all' | ListingStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'pending_review', label: 'Pending Review' },
  { key: 'live', label: 'Live' },
  { key: 'sold', label: 'Sold' },
  { key: 'archived', label: 'Archived' },
  { key: 'rejected', label: 'Rejected' },
];

function getStatusInfo(status: ListingStatus) {
  switch (status) {
    case 'live':
      return { label: 'Live', color: '#10B981', bg: '#10B98118' };
    case 'sold':
      return { label: 'Sold', color: '#6B7280', bg: '#6B728018' };
    case 'draft':
      return { label: 'Draft', color: '#9CA3AF', bg: '#9CA3AF18' };
    case 'pending_review':
      return { label: 'Pending Review', color: '#D9AC4E', bg: '#D9AC4E18' };
    case 'rejected':
      return { label: 'Rejected', color: '#EF4444', bg: '#EF444418' };
    case 'archived':
      return { label: 'Archived', color: '#9CA3AF', bg: '#9CA3AF18' };
    default:
      return { label: status, color: '#6B7280', bg: '#6B728018' };
  }
}

export default function Products() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyListings();
      setListings(data);
    } catch (error) {
      logError(error, { area: 'Products.load' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runManageAction(product: Listing) {
    const action = getManageAction(product.status);
    if (!action) return;

    Alert.alert(
      action.label,
      action.destructive
        ? `Delete "${product.title}"? This can't be undone.`
        : `${action.label} "${product.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.label,
          style: action.destructive ? 'destructive' : 'default',
          onPress: async () => {
            try {
              if (product.status === 'draft') {
                await deleteListing(product.id);
              } else if (product.status === 'live') {
                await archiveListing(product.id);
              } else {
                await moveListingToDraft(product.id);
              }
              await load();
            } catch (error) {
              logError(error, { area: 'Products.runManageAction' });
              Alert.alert('Could not update listing', error instanceof Error ? error.message : 'Please try again.');
            }
          },
        },
      ],
    );
  }

  const filtered = listings.filter((p) => activeFilter === 'all' || p.status === activeFilter);
  const liveCount = listings.filter((p) => p.status === 'live').length;
  const soldCount = listings.filter((p) => p.status === 'sold').length;
  const revenue = listings.filter((p) => p.status === 'sold').reduce((sum, p) => sum + p.price, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
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

          <View style={s.summaryRow}>
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>{listings.length}</Text>
              <Text style={s.summaryLabel}>Total</Text>
            </View>
            <View style={s.summaryDot} />
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>{liveCount}</Text>
              <Text style={s.summaryLabel}>Live</Text>
            </View>
            <View style={s.summaryDot} />
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>{soldCount}</Text>
              <Text style={s.summaryLabel}>Sold</Text>
            </View>
            <View style={s.summaryDot} />
            <View style={s.summaryItem}>
              <Text style={s.summaryValue}>₱{revenue.toLocaleString()}</Text>
              <Text style={s.summaryLabel}>Revenue</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setActiveFilter(f.key)}
            style={[s.filterPill, activeFilter === f.key && s.filterPillActive]}>
            <Text style={[s.filterPillText, activeFilter === f.key && s.filterPillTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#4289AB" />
      ) : filtered.length === 0 ? (
        <View style={s.emptyState}>
          <Package size={40} color="#CBD5E1" />
          <Text style={s.emptyText}>
            {listings.length === 0 ? "You haven't listed anything yet." : 'No products match this filter.'}
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {filtered.map((product, idx) => {
            const statusInfo = getStatusInfo(product.status);
            const editable = isEditable(product.status);
            return (
              <Animated.View key={product.id} entering={FadeInDown.delay(idx * 60).duration(400)}>
                <View style={s.productCard}>
                  <View style={s.productRow}>
                    <Pressable
                      style={s.productRowPressable}
                      disabled={!editable}
                      onPress={() =>
                        router.push({
                          pathname: '/(seller-dashboard)/AddProduct',
                          params: { editId: product.id },
                        } as any)
                      }>
                      <Image source={{ uri: product.cover_image_url ?? undefined }} style={s.productImage} />
                      <View style={s.productInfo}>
                        <Text style={s.productName} numberOfLines={1}>{product.title}</Text>
                        <View style={s.priceRow}>
                          <Text style={s.productPrice}>
                            {product.currency} {(product.current_bid_amount ?? product.price).toLocaleString()}
                          </Text>
                          {product.compare_at_price ? (
                            <Text style={s.originalPrice}>{product.currency} {product.compare_at_price.toLocaleString()}</Text>
                          ) : null}
                        </View>
                        {product.listing_type !== 'instant_buy' ? (
                          <Text style={s.auctionTag}>
                            Auction · {product.bid_count} bid{product.bid_count === 1 ? '' : 's'}
                          </Text>
                        ) : null}
                        {editable ? <Text style={s.editHint}>Tap to edit</Text> : null}
                      </View>
                    </Pressable>
                    <View style={s.productMeta}>
                      <View style={[s.statusBadge, { backgroundColor: statusInfo.bg }]}>
                        <Text style={[s.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                      </View>
                      {getManageAction(product.status) ? (
                        <Pressable
                          onPress={() => runManageAction(product)}
                          hitSlop={8}
                          style={s.manageBtn}>
                          {getManageAction(product.status)?.destructive ? (
                            <Trash2 size={14} color="#EF4444" />
                          ) : (
                            <Text style={s.manageBtnText}>{getManageAction(product.status)?.label}</Text>
                          )}
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}

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
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14, gap: 16 },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#fff' },
  summaryLabel: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  summaryDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.3)' },

  filterRow: { flexGrow: 0, height: 56, paddingVertical: 12 },
  filterPill: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  filterPillActive: { backgroundColor: '#4289AB', borderColor: '#4289AB' },
  filterPillText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#6B7280' },
  filterPillTextActive: { color: '#fff' },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10, paddingHorizontal: 32 },
  emptyText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF', textAlign: 'center' },

  productCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  productRow: { flexDirection: 'row', gap: 12 },
  productRowPressable: { flex: 1, flexDirection: 'row', gap: 12 },
  editHint: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#4289AB', marginTop: 3 },
  productImage: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#E5E7EB' },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1A365D' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  productPrice: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#4289AB' },
  originalPrice: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#D1D5DB', textDecorationLine: 'line-through' },
  auctionTag: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: '#D9AC4E', marginTop: 3 },
  productMeta: { alignItems: 'flex-end', justifyContent: 'center', gap: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  manageBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  manageBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: '#6B7280', textDecorationLine: 'underline' },

  fab: { position: 'absolute', bottom: 24, right: 20, borderRadius: 28, elevation: 8, shadowColor: '#4289AB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
