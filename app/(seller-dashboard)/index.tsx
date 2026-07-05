import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Package,
  ClipboardList,
  BarChart2,
  Tag,
  Settings,
  Star,
  Bell,
  CircleCheckBig,
  Clock,
  Radio,
  MessageSquare,
  Home,
  Megaphone,
  HelpCircle,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { getMyListings } from '@/lib/listings';
import type { Listing } from '@/types/marketplace';
import { getMySalesOrderItems } from '@/lib/orders';
import { logError } from '@/lib/observability';

const QUICK_ACTIONS = [
  { label: 'My Products', icon: Package, color: '#4289AB', route: '/(seller-dashboard)/Products' as const },
  { label: 'Orders', icon: ClipboardList, color: '#6B7FD7', route: '/(seller-dashboard)/Orders' as const },
  { label: 'Analytics', icon: BarChart2, color: '#10B981', route: '/(seller-dashboard)/Analytics' as const },
  { label: 'Go Live', icon: Radio, color: '#E53935', route: '/(main)/LiveSellingScreen' as const },
  { label: 'Promotions', icon: Tag, color: '#F59E0B', route: null },
  { label: 'Marketing', icon: Megaphone, color: '#EC4899', route: null },
  { label: 'Messages', icon: MessageSquare, color: '#8B5CF6', route: '/(main)/MessagesScreen' as const },
  { label: 'Shop Settings', icon: Settings, color: '#6B7280', route: null },
  { label: 'Help Center', icon: HelpCircle, color: '#14B8A6', route: null },
];

function handleQuickActionPress(action: typeof QUICK_ACTIONS[number]) {
  if (action.route) {
    router.push(action.route as any);
    return;
  }
  Alert.alert('Coming soon', `${action.label} is not available yet.`);
}

type SaleItem = Awaited<ReturnType<typeof getMySalesOrderItems>>[number];

export default function SellerDashboard() {
  const { profile } = useAuth();
  const [shopName, setShopName] = useState<string | null>(null);
  const [sellerVerification, setSellerVerification] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [recentSales, setRecentSales] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: seller }, myListings, sales] = await Promise.all([
        supabase.from('seller_profiles').select('shop_name, verification_status').maybeSingle(),
        getMyListings(),
        getMySalesOrderItems(),
      ]);
      setShopName(seller?.shop_name ?? null);
      setSellerVerification(seller?.verification_status ?? null);
      setListings(myListings);
      setRecentSales(sales.slice(0, 3));
    } catch (error) {
      logError(error, { area: 'SellerDashboard.load' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pendingReviewCount = listings.filter((l) => l.status === 'pending_review').length;
  const liveCount = listings.filter((l) => l.status === 'live').length;
  const soldCount = listings.filter((l) => l.status === 'sold').length;
  const draftCount = listings.filter((l) => l.status === 'draft').length;

  const TODO_ITEMS = [
    { label: 'Drafts', count: draftCount, icon: Clock, color: '#9CA3AF' },
    { label: 'Pending', count: pendingReviewCount, icon: Package, color: '#D9AC4E' },
    { label: 'Live', count: liveCount, icon: Radio, color: '#4289AB' },
    { label: 'Sold', count: soldCount, icon: Star, color: '#10B981' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <View style={st.headerWrap}>
        <LinearGradient colors={['#1A365D', '#2C5F8A']} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView edges={['top']} style={st.headerContent}>
          <View style={st.headerRow}>
            <Text style={st.dashboardTitle}>Seller Center</Text>
            <View style={st.headerRight}>
              <Pressable
                style={st.bellBtn}
                onPress={() => router.push('/(profile)/Notifications' as any)}>
                <Bell size={18} color="#fff" />
              </Pressable>
              <Pressable onPress={() => router.replace('/(tabs)/(store)' as any)} style={st.exitBtn}>
                <Home size={14} color="#fff" />
                <Text style={st.exitText}>Home</Text>
              </Pressable>
            </View>
          </View>

          <View style={st.storeRow}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={st.storeAvatar} />
            ) : (
              <View style={[st.storeAvatar, { backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' }}>
                  {(shopName || profile?.full_name || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={st.storeName}>{shopName ?? profile?.full_name ?? 'My Shop'}</Text>
                {sellerVerification === 'verified' || sellerVerification === 'early_access' ? (
                  <CircleCheckBig size={16} color="#6DB8D8" />
                ) : null}
              </View>
              <Text style={st.storeFollowers}>
                {listings.length} listing{listings.length === 1 ? '' : 's'}
                {sellerVerification === 'early_access' ? ' · Early Access Seller' : ''}
              </Text>
            </View>
            <Pressable
              style={st.viewStoreBtn}
              onPress={() => router.push('/(tabs)/(me)' as any)}>
              <Text style={st.viewStoreText}>My Profile</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#4289AB" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View style={st.sectionHeader}>
              <Text style={st.sectionTitle}>Listing Status</Text>
              <Pressable onPress={() => router.push('/(seller-dashboard)/Products' as any)}>
                <Text style={st.sectionLink}>View Products</Text>
              </Pressable>
            </View>
            <View style={st.todoRow}>
              {TODO_ITEMS.map((item) => (
                <Pressable key={item.label} style={st.todoCard}
                  onPress={() => router.push('/(seller-dashboard)/Products' as any)}>
                  <View style={[st.todoIconWrap, { backgroundColor: item.color + '15' }]}>
                    <item.icon size={20} color={item.color} />
                    {item.count > 0 && (
                      <View style={[st.todoBadge, { backgroundColor: item.color }]}>
                        <Text style={st.todoBadgeText}>{item.count}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={st.todoLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <View style={st.sectionHeader}>
              <Text style={st.sectionTitle}>Quick Actions</Text>
            </View>
            <View style={st.actionsCard}>
              <View style={st.actionsGrid}>
                {QUICK_ACTIONS.map((action) => (
                  <Pressable
                    key={action.label}
                    style={st.actionItem}
                    onPress={() => handleQuickActionPress(action)}>
                    <View style={[st.actionIconWrap, { backgroundColor: action.color + '12' }]}>
                      <action.icon size={22} color={action.color} />
                    </View>
                    <Text style={st.actionLabel} numberOfLines={1}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <View style={st.sectionHeader}>
              <Text style={st.sectionTitle}>Recent Sales</Text>
              <Pressable onPress={() => router.push('/(seller-dashboard)/Orders' as any)}>
                <Text style={st.sectionLink}>See All</Text>
              </Pressable>
            </View>
            {recentSales.length === 0 ? (
              <Text style={st.emptyText}>No sales yet.</Text>
            ) : (
              recentSales.map((sale) => (
                <Pressable key={sale.id} style={st.orderCard}
                  onPress={() => router.push('/(seller-dashboard)/Orders' as any)}>
                  <Image source={{ uri: sale.listings?.cover_image_url ?? undefined }} style={st.orderImage} />
                  <View style={{ flex: 1 }}>
                    <Text style={st.orderItem} numberOfLines={1}>{sale.listings?.title ?? 'Item'}</Text>
                    <Text style={st.orderId}>{sale.buyer?.full_name ?? sale.buyer?.username ?? 'Buyer'}</Text>
                    <Text style={st.orderAmount}>{sale.currency} {(Number(sale.unit_price) * sale.quantity).toLocaleString()}</Text>
                  </View>
                  <View style={st.orderStatusBadge}>
                    <Text style={st.orderStatusText}>{sale.orders?.status ?? 'pending'}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  headerWrap: { paddingBottom: 20, position: 'relative' },
  headerContent: { paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dashboardTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' },
  bellBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  exitBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  exitText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#fff' },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  storeAvatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, borderColor: '#fff' },
  storeName: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#fff' },
  storeFollowers: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  viewStoreBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: '#fff' },
  viewStoreText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#4289AB' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
  sectionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#1A365D' },
  sectionLink: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#4289AB' },
  emptyText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF', paddingHorizontal: 16 },

  todoRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  todoCard: { flex: 1, alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 4, gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  todoIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  todoBadge: { position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  todoBadgeText: { fontFamily: 'Poppins_700Bold', fontSize: 9, color: '#fff' },
  todoLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: '#374151', textAlign: 'center', width: '100%' },

  actionsCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
  actionItem: {
    flexBasis: '33.33%',
    flexGrow: 0,
    flexShrink: 0,
    maxWidth: '33.33%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 4,
    gap: 8,
  },
  actionIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actionLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#374151', textAlign: 'center', flexShrink: 1 },

  orderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 12, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  orderImage: { width: 52, height: 52, borderRadius: 10, backgroundColor: '#E5E7EB' },
  orderItem: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1A365D' },
  orderId: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  orderAmount: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#4289AB', marginTop: 3 },
  orderStatusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: '#EFF6FA' },
  orderStatusText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#4289AB', textTransform: 'capitalize' },
});
