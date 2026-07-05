import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ChevronLeft,
  DollarSign,
  ShoppingCart,
  Package,
  Radio,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { getMyListings } from '@/lib/listings';
import { getMySalesOrderItems } from '@/lib/orders';
import { logError } from '@/lib/observability';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [listingCount, setListingCount] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [topListings, setTopListings] = useState<{ title: string; sold: number; revenue: number }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listings, sales] = await Promise.all([getMyListings(), getMySalesOrderItems()]);
      setListingCount(listings.length);
      setLiveCount(listings.filter((l) => l.status === 'live').length);

      const paidSales = sales.filter((s) => s.orders?.status === 'paid' || s.orders?.status === 'fulfilled');
      setOrderCount(paidSales.length);
      setRevenue(paidSales.reduce((sum, s) => sum + Number(s.unit_price) * s.quantity, 0));

      const byListing = new Map<string, { title: string; sold: number; revenue: number }>();
      for (const sale of paidSales) {
        const title = sale.listings?.title ?? 'Item';
        const existing = byListing.get(title) ?? { title, sold: 0, revenue: 0 };
        existing.sold += sale.quantity;
        existing.revenue += Number(sale.unit_price) * sale.quantity;
        byListing.set(title, existing);
      }
      setTopListings([...byListing.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5));
    } catch (error) {
      logError(error, { area: 'Analytics.load' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const KPI_DATA = [
    { label: 'Revenue', value: `₱${revenue.toLocaleString()}`, icon: DollarSign, color: '#10B981' },
    { label: 'Paid Orders', value: String(orderCount), icon: ShoppingCart, color: '#4289AB' },
    { label: 'Live Listings', value: String(liveCount), icon: Radio, color: '#E53935' },
    { label: 'Total Listings', value: String(listingCount), icon: Package, color: '#D9AC4E' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <LinearGradient colors={['#1A365D', '#2C5F8A']} style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.headerRow}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <ChevronLeft size={22} color="#fff" />
            </Pressable>
            <Text style={s.headerTitle}>Analytics</Text>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#4289AB" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={s.kpiGrid}>
            {KPI_DATA.map((kpi, idx) => (
              <Animated.View key={kpi.label} entering={FadeInDown.delay(idx * 60).duration(400)} style={s.kpiCard}>
                <View style={[s.kpiIconWrap, { backgroundColor: `${kpi.color}18` }]}>
                  <kpi.icon size={18} color={kpi.color} />
                </View>
                <Text style={s.kpiValue}>{kpi.value}</Text>
                <Text style={s.kpiLabel}>{kpi.label}</Text>
              </Animated.View>
            ))}
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>Top Selling Items</Text>
            {topListings.length === 0 ? (
              <Text style={s.emptyText}>No paid sales yet.</Text>
            ) : (
              topListings.map((item, idx) => (
                <View key={item.title + idx} style={s.topRow}>
                  <View style={s.rankBadge}>
                    <Text style={s.rankText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.topName} numberOfLines={1}>{item.title}</Text>
                    <Text style={s.topSold}>{item.sold} sold</Text>
                  </View>
                  <Text style={s.topRevenue}>₱{item.revenue.toLocaleString()}</Text>
                </View>
              ))
            )}
          </View>
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

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16 },
  kpiCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  kpiIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  kpiValue: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#1A365D' },
  kpiLabel: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 2 },

  section: { paddingHorizontal: 16, paddingTop: 8 },
  sectionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#1A365D', marginBottom: 12 },
  emptyText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  rankBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#EFF6FA', alignItems: 'center', justifyContent: 'center' },
  rankText: { fontFamily: 'Poppins_700Bold', fontSize: 11, color: '#4289AB' },
  topName: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1A365D' },
  topSold: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  topRevenue: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#4289AB' },
});
