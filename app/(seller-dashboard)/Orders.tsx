import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type StatusKey = 'all' | 'unpaid' | 'to-ship' | 'shipping' | 'delivered' | 'cancelled' | 'return';

const STATUS_TABS: { key: StatusKey; label: string; icon: any; count: number }[] = [
  { key: 'all', label: 'All', icon: Package, count: 42 },
  { key: 'unpaid', label: 'Unpaid', icon: Clock, count: 3 },
  { key: 'to-ship', label: 'To Ship', icon: Package, count: 5 },
  { key: 'shipping', label: 'Shipping', icon: Truck, count: 8 },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, count: 24 },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle, count: 1 },
  { key: 'return', label: 'Return', icon: RotateCcw, count: 1 },
];

const ORDERS = [
  {
    id: 'ORD-9821',
    buyer: 'Maria Santos',
    buyerAvatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    date: 'Mar 10, 2026',
    items: [
      { name: 'Signed Tour Jacket', qty: 1, price: 7200, imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=120&q=80' },
    ],
    total: 7200,
    status: 'to-ship',
    statusLabel: 'To Ship',
    statusColor: '#F59E0B',
    shippingMethod: 'LUVLOTS Express',
  },
  {
    id: 'ORD-9817',
    buyer: 'James Reyes',
    buyerAvatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    date: 'Mar 9, 2026',
    items: [
      { name: 'Vintage Sunglasses', qty: 1, price: 3500, imageUri: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=120&q=80' },
      { name: 'Concert Poster', qty: 2, price: 1500, imageUri: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=120&q=80' },
    ],
    total: 6500,
    status: 'shipping',
    statusLabel: 'Shipping',
    statusColor: '#4289AB',
    shippingMethod: 'J&T Express',
    trackingNo: 'JT-0912874612',
  },
  {
    id: 'ORD-9803',
    buyer: 'Tricia Lim',
    buyerAvatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    date: 'Mar 7, 2026',
    items: [
      { name: 'Luxury Handbag', qty: 1, price: 12000, imageUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&q=80' },
    ],
    total: 12000,
    status: 'delivered',
    statusLabel: 'Delivered',
    statusColor: '#10B981',
    shippingMethod: 'LUVLOTS Express',
  },
  {
    id: 'ORD-9798',
    buyer: 'Carlo Mendoza',
    buyerAvatar: 'https://randomuser.me/api/portraits/men/35.jpg',
    date: 'Mar 6, 2026',
    items: [
      { name: 'Signed Vinyl Record', qty: 1, price: 2800, imageUri: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=120&q=80' },
    ],
    total: 2800,
    status: 'delivered',
    statusLabel: 'Delivered',
    statusColor: '#10B981',
    shippingMethod: 'Flash Express',
  },
  {
    id: 'ORD-9790',
    buyer: 'Angela Cruz',
    buyerAvatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    date: 'Mar 5, 2026',
    items: [
      { name: 'Limited Edition Sneakers', qty: 1, price: 8500, imageUri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&q=80' },
    ],
    total: 8500,
    status: 'unpaid',
    statusLabel: 'Unpaid',
    statusColor: '#EF4444',
    shippingMethod: 'Standard',
  },
  {
    id: 'ORD-9782',
    buyer: 'Ryan Tan',
    buyerAvatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    date: 'Mar 3, 2026',
    items: [
      { name: 'Handcrafted Leather Bag', qty: 1, price: 12000, imageUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&q=80' },
    ],
    total: 12000,
    status: 'cancelled',
    statusLabel: 'Cancelled',
    statusColor: '#9CA3AF',
    shippingMethod: 'N/A',
  },
];

export default function Orders() {
  const [activeStatus, setActiveStatus] = useState<StatusKey>('all');

  const filtered = ORDERS.filter((o) => {
    if (activeStatus === 'all') return true;
    return o.status === activeStatus;
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
            <Text style={s.headerTitle}>Order Management</Text>
            <Pressable style={s.searchBtn}>
              <Search size={18} color="#fff" />
            </Pressable>
          </View>

          {/* Revenue summary */}
          <View style={s.revenueRow}>
            <View style={s.revenueItem}>
              <Text style={s.revenueValue}>₱48,200</Text>
              <Text style={s.revenueLabel}>This Month</Text>
            </View>
            <View style={s.revenueDivider} />
            <View style={s.revenueItem}>
              <Text style={s.revenueValue}>42</Text>
              <Text style={s.revenueLabel}>Total Orders</Text>
            </View>
            <View style={s.revenueDivider} />
            <View style={s.revenueItem}>
              <Text style={s.revenueValue}>98%</Text>
              <Text style={s.revenueLabel}>Fulfillment</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Status tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.statusRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}>
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveStatus(tab.key)}
              style={[s.statusTab, isActive && s.statusTabActive]}>
              <tab.icon size={16} color={isActive ? '#4289AB' : '#9CA3AF'} />
              <Text style={[s.statusTabText, isActive && s.statusTabTextActive]}>{tab.label}</Text>
              {tab.count > 0 && (
                <View style={[s.statusCount, isActive && s.statusCountActive]}>
                  <Text style={[s.statusCountText, isActive && s.statusCountTextActive]}>{tab.count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Orders list */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {filtered.length === 0 ? (
          <View style={s.emptyState}>
            <Package size={48} color="#D1D5DB" />
            <Text style={s.emptyText}>No orders in this category</Text>
          </View>
        ) : (
          filtered.map((order, idx) => (
            <Animated.View key={order.id} entering={FadeInDown.delay(idx * 60).duration(400)}>
              <Pressable style={s.orderCard}>
                {/* Order header */}
                <View style={s.orderHeader}>
                  <View style={s.buyerRow}>
                    <Image source={{ uri: order.buyerAvatar }} style={s.buyerAvatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.buyerName}>{order.buyer}</Text>
                      <Text style={s.orderId}>{order.id} · {order.date}</Text>
                    </View>
                    <View style={[s.orderStatusBadge, { backgroundColor: order.statusColor + '18' }]}>
                      <Text style={[s.orderStatusText, { color: order.statusColor }]}>{order.statusLabel}</Text>
                    </View>
                  </View>
                </View>

                {/* Items */}
                {order.items.map((item, i) => (
                  <View key={i} style={s.itemRow}>
                    <Image source={{ uri: item.imageUri }} style={s.itemImage} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={s.itemQty}>x{item.qty}</Text>
                    </View>
                    <Text style={s.itemPrice}>₱{item.price.toLocaleString()}</Text>
                  </View>
                ))}

                {/* Footer */}
                <View style={s.orderFooter}>
                  <View>
                    <Text style={s.shippingLabel}>{order.shippingMethod}</Text>
                    {order.trackingNo && (
                      <Text style={s.trackingNo}>{order.trackingNo}</Text>
                    )}
                  </View>
                  <View style={s.totalWrap}>
                    <Text style={s.totalLabel}>Total:</Text>
                    <Text style={s.totalValue}>₱{order.total.toLocaleString()}</Text>
                  </View>
                </View>

                {/* Actions */}
                {order.status === 'to-ship' && (
                  <View style={s.actionRow}>
                    <Pressable style={s.actionBtnOutline}>
                      <Text style={s.actionBtnOutlineText}>Print Label</Text>
                    </Pressable>
                    <Pressable style={s.actionBtnFilled}>
                      <Text style={s.actionBtnFilledText}>Ship Now</Text>
                    </Pressable>
                  </View>
                )}
                {order.status === 'unpaid' && (
                  <View style={s.actionRow}>
                    <Pressable style={s.actionBtnOutline}>
                      <Text style={s.actionBtnOutlineText}>Remind Buyer</Text>
                    </Pressable>
                    <Pressable style={[s.actionBtnFilled, { backgroundColor: '#EF4444' }]}>
                      <Text style={s.actionBtnFilledText}>Cancel Order</Text>
                    </Pressable>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' },
  searchBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },

  revenueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 16, borderRadius: 12, padding: 14 },
  revenueItem: { flex: 1, alignItems: 'center' },
  revenueValue: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: '#fff' },
  revenueLabel: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  revenueDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.15)' },

  statusRow: { paddingVertical: 12 },
  statusTab: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  statusTabActive: { borderColor: '#4289AB', backgroundColor: '#EFF6FA' },
  statusTabText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#9CA3AF' },
  statusTabTextActive: { color: '#4289AB' },
  statusCount: { backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1, minWidth: 20, alignItems: 'center' },
  statusCountActive: { backgroundColor: '#4289AB20' },
  statusCountText: { fontFamily: 'Poppins_700Bold', fontSize: 10, color: '#9CA3AF' },
  statusCountTextActive: { color: '#4289AB' },

  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#9CA3AF' },

  orderCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  orderHeader: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  buyerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  buyerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB' },
  buyerName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1A365D' },
  orderId: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  orderStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  orderStatusText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11 },

  itemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  itemImage: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#E5E7EB' },
  itemName: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#374151' },
  itemQty: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  itemPrice: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1A365D' },

  orderFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  shippingLabel: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF' },
  trackingNo: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#4289AB', marginTop: 2 },
  totalWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  totalLabel: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  totalValue: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#4289AB' },

  actionRow: { flexDirection: 'row', gap: 10, padding: 14, paddingTop: 0 },
  actionBtnOutline: { flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1, borderColor: '#4289AB', alignItems: 'center' },
  actionBtnOutlineText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#4289AB' },
  actionBtnFilled: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: '#4289AB', alignItems: 'center' },
  actionBtnFilledText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#fff' },
});
