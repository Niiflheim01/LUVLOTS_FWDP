import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, Package } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { getMySalesOrderItems } from '@/lib/orders';
import { logError } from '@/lib/observability';

type StatusKey = 'all' | 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';

const STATUS_TABS: { key: StatusKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending Payment' },
  { key: 'paid', label: 'Paid' },
  { key: 'fulfilled', label: 'Fulfilled' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'refunded', label: 'Refunded' },
];

function statusColor(status: string) {
  switch (status) {
    case 'paid': return '#10B981';
    case 'fulfilled': return '#4289AB';
    case 'cancelled': return '#9CA3AF';
    case 'refunded': return '#EF4444';
    default: return '#D9AC4E';
  }
}

type SaleItem = Awaited<ReturnType<typeof getMySalesOrderItems>>[number];

export default function Orders() {
  const [activeStatus, setActiveStatus] = useState<StatusKey>('all');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMySalesOrderItems();
      setItems(data);
    } catch (error) {
      logError(error, { area: 'SellerOrders.load' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((item) => {
    if (activeStatus === 'all') return true;
    const status = item.orders?.status ?? 'pending';
    if (activeStatus === 'pending') return status === 'pending' || status === 'awaiting_payment';
    return status === activeStatus;
  });

  const totalRevenue = items
    .filter((item) => item.orders?.status === 'paid' || item.orders?.status === 'fulfilled')
    .reduce((sum, item) => sum + Number(item.unit_price) * item.quantity, 0);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <LinearGradient colors={['#1A365D', '#2C5F8A']} style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.headerRow}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <ChevronLeft size={22} color="#fff" />
            </Pressable>
            <Text style={s.headerTitle}>Order Management</Text>
            <View style={{ width: 38 }} />
          </View>

          <View style={s.revenueRow}>
            <View style={s.revenueItem}>
              <Text style={s.revenueValue}>₱{totalRevenue.toLocaleString()}</Text>
              <Text style={s.revenueLabel}>Revenue</Text>
            </View>
            <View style={s.revenueDivider} />
            <View style={s.revenueItem}>
              <Text style={s.revenueValue}>{items.length}</Text>
              <Text style={s.revenueLabel}>Total Sales</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.statusRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 6, alignItems: 'center' }}>
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveStatus(tab.key)}
              style={[s.statusTab, isActive && s.statusTabActive]}>
              <Text style={[s.statusTabText, isActive && s.statusTabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#4289AB" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {filtered.length === 0 ? (
            <View style={s.emptyState}>
              <Package size={48} color="#D1D5DB" />
              <Text style={s.emptyText}>No orders in this category</Text>
            </View>
          ) : (
            filtered.map((item, idx) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(idx * 60).duration(400)}>
                <View style={s.orderCard}>
                  <View style={s.orderHeader}>
                    <View style={s.buyerRow}>
                      {item.buyer?.avatar_url ? (
                        <Image source={{ uri: item.buyer.avatar_url }} style={s.buyerAvatar} />
                      ) : (
                        <View style={[s.buyerAvatar, { alignItems: 'center', justifyContent: 'center' }]}>
                          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 13, color: '#4289AB' }}>
                            {(item.buyer?.full_name || item.buyer?.username || '?').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={s.buyerName}>{item.buyer?.full_name ?? item.buyer?.username ?? 'Buyer'}</Text>
                        <Text style={s.orderId}>
                          {item.orders?.created_at ? new Date(item.orders.created_at).toLocaleDateString() : ''}
                        </Text>
                      </View>
                      <View style={[s.orderStatusBadge, { backgroundColor: statusColor(item.orders?.status ?? 'pending') + '18' }]}>
                        <Text style={[s.orderStatusText, { color: statusColor(item.orders?.status ?? 'pending') }]}>
                          {item.orders?.status ?? 'pending'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={s.itemRow}>
                    <Image source={{ uri: item.listings?.cover_image_url ?? undefined }} style={s.itemImage} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.itemName} numberOfLines={1}>{item.listings?.title ?? 'Item'}</Text>
                      <Text style={s.itemQty}>x{item.quantity}</Text>
                    </View>
                    <Text style={s.itemPrice}>{item.currency} {(Number(item.unit_price) * item.quantity).toLocaleString()}</Text>
                  </View>
                </View>
              </Animated.View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' },

  revenueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 16, borderRadius: 12, padding: 14 },
  revenueItem: { flex: 1, alignItems: 'center' },
  revenueValue: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: '#fff' },
  revenueLabel: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  revenueDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.15)' },

  statusRow: { flexGrow: 0, height: 56, paddingVertical: 12 },
  statusTab: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 5, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  statusTabActive: { borderColor: '#4289AB', backgroundColor: '#EFF6FA' },
  statusTabText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#9CA3AF' },
  statusTabTextActive: { color: '#4289AB' },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#9CA3AF' },

  orderCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  orderHeader: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  buyerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  buyerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FA' },
  buyerName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1A365D' },
  orderId: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  orderStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  orderStatusText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, textTransform: 'capitalize' },

  itemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  itemImage: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#E5E7EB' },
  itemName: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#374151' },
  itemQty: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  itemPrice: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1A365D' },
});
