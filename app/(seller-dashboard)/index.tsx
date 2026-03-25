import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
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
  ChevronRight,
  Star,
  Bell,
  CircleCheckBig,
  Clock,
  Truck,
  RotateCcw,
  Radio,
  MessageSquare,
  Home,
  Wallet,
  ArrowUpRight,
  Megaphone,
  HelpCircle,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');

const STORE = {
  name: "Apl's Vault",
  avatar: 'https://www.famousbirthdays.com/faces/pineda-allan-image.jpg',
  banner: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  rating: 4.9,
  followers: 152400,
  verified: true,
  joined: 'Jan 2024',
};

/* ─── To-Do List (Shopee-style) ─── */
const TODO_ITEMS = [
  { label: 'Unpaid', count: 3, icon: Clock, color: '#EF4444' },
  { label: 'To Ship', count: 5, icon: Package, color: '#F59E0B' },
  { label: 'Shipping', count: 8, icon: Truck, color: '#4289AB' },
  { label: 'Returns', count: 1, icon: RotateCcw, color: '#6B7FD7' },
  { label: 'Reviews', count: 4, icon: Star, color: '#10B981' },
];

/* ─── Quick Actions ─── */
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

/* ─── Recent Orders ─── */
const RECENT_ORDERS = [
  { id: 'ORD-9821', buyer: 'Maria Santos', item: 'Signed Tour Jacket', amount: '₱7,200', status: 'To Ship', statusColor: '#F59E0B', imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=120&q=80' },
  { id: 'ORD-9817', buyer: 'James Reyes', item: 'Vintage Sunglasses', amount: '₱3,500', status: 'Shipping', statusColor: '#4289AB', imageUri: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=120&q=80' },
  { id: 'ORD-9803', buyer: 'Tricia Lim', item: 'Luxury Handbag', amount: '₱12,000', status: 'Delivered', statusColor: '#10B981', imageUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&q=80' },
];

function handleQuickActionPress(action: typeof QUICK_ACTIONS[number]) {
  if (action.route) {
    router.push(action.route as any);
    return;
  }
  if (action.label === 'Promotions') {
    Alert.alert('Promotions', 'Create discount codes, flash sales, and bundle deals to boost your shop visibility.');
  } else if (action.label === 'Marketing') {
    Alert.alert('Marketing', 'Boost your listings with sponsored ads and featured placements on the LUVLOTS feed.');
  } else if (action.label === 'Shop Settings') {
    Alert.alert('Shop Settings', 'Manage your shop name, description, shipping options, and return policies.');
  } else if (action.label === 'Help Center') {
    Alert.alert('Help Center', 'For seller support, email sellers@luvlots.com or visit our LUVLOTS Seller FAQ.', [{ text: 'OK' }]);
  }
}

export default function SellerDashboard() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      {/* ─── Header Banner ─── */}
      <View style={st.headerWrap}>
        <Image source={{ uri: STORE.banner }} style={st.bannerImage} />
        <LinearGradient
          colors={['rgba(26,54,80,0.35)', 'rgba(26,54,80,0.92)']}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView edges={['top']} style={st.headerContent}>
          <View style={st.headerRow}>
            <Text style={st.dashboardTitle}>Seller Center</Text>
            <View style={st.headerRight}>
              <Pressable
                style={st.bellBtn}
                onPress={() => router.push('/(profile)/Notifications' as any)}>
                <Bell size={18} color="#fff" />
                <View style={st.bellDot} />
              </Pressable>
              <Pressable onPress={() => router.replace('/(tabs)/(store)' as any)} style={st.exitBtn}>
                <Home size={14} color="#fff" />
                <Text style={st.exitText}>Home</Text>
              </Pressable>
            </View>
          </View>

          {/* Store info */}
          <View style={st.storeRow}>
            <Image source={{ uri: STORE.avatar }} style={st.storeAvatar} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={st.storeName}>{STORE.name}</Text>
                {STORE.verified && <CircleCheckBig size={16} color="#6DB8D8" />}
              </View>
              <Text style={st.storeFollowers}>{STORE.followers.toLocaleString()} followers · {STORE.rating}★ · Joined {STORE.joined}</Text>
            </View>
            <Pressable
              style={st.viewStoreBtn}
              onPress={() => router.push('/(tabs)/(me)' as any)}>
              <Text style={st.viewStoreText}>My Profile</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      {/* ─── Earnings Card (overlapping header) ─── */}
      <View style={st.earningsCard}>
        <LinearGradient colors={['#4289AB', '#2C5F8A']} style={st.earningsGradient}>
          <View style={st.earningsRow}>
            <View style={st.earningItem}>
              <Text style={st.earningLabel}>Today's Sales</Text>
              <Text style={st.earningValue}>₱3,840</Text>
              <View style={st.earningTrend}>
                <ArrowUpRight size={10} color="#6DD8A0" />
                <Text style={st.earningTrendText}>+18%</Text>
              </View>
            </View>
            <View style={st.earningDivider} />
            <View style={st.earningItem}>
              <Text style={st.earningLabel}>This Month</Text>
              <Text style={st.earningValue}>₱48,200</Text>
              <View style={st.earningTrend}>
                <ArrowUpRight size={10} color="#6DD8A0" />
                <Text style={st.earningTrendText}>+12%</Text>
              </View>
            </View>
            <View style={st.earningDivider} />
            <View style={st.earningItem}>
              <Text style={st.earningLabel}>To Release</Text>
              <Text style={st.earningValue}>₱12,500</Text>
            </View>
          </View>
          <Pressable
            style={st.withdrawBtn}
            onPress={() => Alert.alert('Payout Requested', 'Your payout of ₱12,500.00 has been submitted. Funds will be transferred within 1–3 business days.', [{ text: 'OK' }])}>
            <Wallet size={14} color="#fff" />
            <Text style={st.withdrawText}>Request Payout</Text>
          </Pressable>
        </LinearGradient>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ─── To-Do List ─── */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={st.sectionHeader}>
            <Text style={st.sectionTitle}>To-Do List</Text>
            <Pressable onPress={() => router.push('/(seller-dashboard)/Orders' as any)}>
              <Text style={st.sectionLink}>View Orders</Text>
            </Pressable>
          </View>
          <View style={st.todoRow}>
            {TODO_ITEMS.map((item) => (
              <Pressable key={item.label} style={st.todoCard}
                onPress={() => router.push('/(seller-dashboard)/Orders' as any)}>
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

        {/* ─── Quick Actions (3×3 grid) ─── */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
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

        {/* ─── Recent Orders ─── */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <View style={st.sectionHeader}>
            <Text style={st.sectionTitle}>Recent Orders</Text>
            <Pressable onPress={() => router.push('/(seller-dashboard)/Orders' as any)}>
              <Text style={st.sectionLink}>See All</Text>
            </Pressable>
          </View>
          {RECENT_ORDERS.map((order) => (
            <Pressable key={order.id} style={st.orderCard}
              onPress={() => router.push('/(seller-dashboard)/Orders' as any)}>
              <Image source={{ uri: order.imageUri }} style={st.orderImage} />
              <View style={{ flex: 1 }}>
                <Text style={st.orderItem} numberOfLines={1}>{order.item}</Text>
                <Text style={st.orderId}>{order.id} · {order.buyer}</Text>
                <Text style={st.orderAmount}>{order.amount}</Text>
              </View>
              <View style={[st.orderStatusBadge, { backgroundColor: order.statusColor + '18' }]}>
                <Text style={[st.orderStatusText, { color: order.statusColor }]}>{order.status}</Text>
              </View>
            </Pressable>
          ))}
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  /* ── Header ── */
  headerWrap: { height: 190, position: 'relative' },
  bannerImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  headerContent: { flex: 1, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dashboardTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' },
  bellBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  bellDot: { position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#E53935', borderWidth: 1.5, borderColor: 'rgba(26,54,80,0.9)' },
  exitBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  exitText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#fff' },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  storeAvatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, borderColor: '#fff' },
  storeName: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#fff' },
  storeFollowers: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  viewStoreBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: '#fff' },
  viewStoreText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#4289AB' },

  /* ── Earnings ── */
  earningsCard: { marginHorizontal: 16, marginTop: -20, borderRadius: 16, overflow: 'hidden', elevation: 6, shadowColor: '#4289AB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
  earningsGradient: { padding: 16 },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  earningItem: { flex: 1, alignItems: 'center' },
  earningDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  earningLabel: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 4, textAlign: 'center' },
  earningValue: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#fff' },
  earningTrend: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 3 },
  earningTrendText: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: '#6DD8A0' },
  withdrawBtn: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 22, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  withdrawText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#fff' },

  /* ── Sections ── */
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
  sectionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#1A365D' },
  sectionLink: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#4289AB' },

  /* ── To-Do ── */
  todoRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  todoCard: { flex: 1, alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 4, gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  todoIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  todoBadge: { position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  todoBadgeText: { fontFamily: 'Poppins_700Bold', fontSize: 9, color: '#fff' },
  todoLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: '#374151', textAlign: 'center', width: '100%' },

  /* ── Quick Actions ── */
  actionsCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  actionItem: { width: '33.33%', alignItems: 'center', paddingVertical: 14, gap: 8 },
  actionIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#374151', textAlign: 'center' },

  /* ── Recent Orders ── */
  orderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 12, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  orderImage: { width: 52, height: 52, borderRadius: 10 },
  orderItem: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1A365D' },
  orderId: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  orderAmount: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#4289AB', marginTop: 3 },
  orderStatusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  orderStatusText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
});
