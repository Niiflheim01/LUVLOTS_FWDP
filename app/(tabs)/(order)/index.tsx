import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Trophy, Gavel, Package, CheckCircle2, Truck, MapPin, ChevronRight } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import EditBidModal from '@/features/order/components/EditBidModal';

type TabKey = 'active' | 'won' | 'lost' | 'purchases';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'active', label: 'Active Bids' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' },
  { key: 'purchases', label: 'Purchases' },
];

const ORDERS = [
  {
    id: '1',
    title: 'ASAP Stage Gown',
    seller: 'Anne Curtis',
    currentBid: 9500,
    yourBid: 9500,
    imageUri: 'https://images.unsplash.com/photo-1484327973588-c31f829103fe?w=300&q=80',
    timeRemaining: '4h 20m 10s',
    status: 'active' as const,
    bidders: 14,
    description: 'Stunning gown worn by Anne Curtis during an ASAP live performance. Authenticated.',
    category: 'Fashion',
    sellerId: '1',
  },
  {
    id: '2',
    title: "It's Showtime Jacket",
    seller: 'Vice Ganda',
    currentBid: 12000,
    yourBid: 12000,
    imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80',
    status: 'won' as const,
    bidders: 21,
    description: "Iconic stage jacket worn by Vice Ganda on It's Showtime. Certificate of authenticity included.",
    category: 'Fashion',
    sellerId: '2',
  },
  {
    id: '3',
    title: 'Diamond Ring',
    seller: 'Ivana Alawi',
    currentBid: 45000,
    yourBid: 42000,
    imageUri: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&q=80',
    status: 'lost' as const,
    bidders: 31,
    description: "18k gold diamond ring from Ivana Alawi's personal jewelry collection.",
    category: 'Jewelry',
    sellerId: '5',
  },
  {
    id: '4',
    title: 'Film Premiere Gown',
    seller: 'Kathryn Bernardo',
    currentBid: 18500,
    yourBid: 18500,
    imageUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80',
    status: 'active' as const,
    bidders: 42,
    timeRemaining: '1h 45m 22s',
    description: 'Gown worn by Kathryn Bernardo at a major Star Magic film premiere. Authenticated.',
    category: 'Fashion',
    sellerId: '3',
  },
];

const PURCHASES = [
  {
    id: 'p1',
    orderNum: 'LV-17322714',
    title: "It's Showtime Jacket",
    seller: 'Vice Ganda',
    total: '12,150',
    imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80',
    payment: 'Cash On Delivery',
    status: 'processing' as const,
    address: '123 Roxas Boulevard, Malate',
    placedAt: 'Mar 18, 2026',
  },
];

const PURCHASE_STEPS = [
  { key: 'placed', label: 'Order Placed', icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

const STEP_ORDER = ['placed', 'processing', 'shipped', 'delivered'];

export default function OrdersScreen() {
  const params = useLocalSearchParams<{ tab?: TabKey }>();
  const [activeTab, setActiveTab] = useState<TabKey>(
    params.tab && ['active', 'won', 'lost', 'purchases'].includes(params.tab) ? params.tab : 'active'
  );
  const [editBidVisible, setEditBidVisible] = useState(false);

  const filteredOrders = ORDERS.filter((order) => {
    return order.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#E8F5E9', color: '#2E7D32', label: 'Active' };
      case 'won':    return { bg: '#FFF3E0', color: '#E65100', label: 'Won' };
      case 'lost':   return { bg: '#FFEBEE', color: '#C62828', label: 'Lost' };
      default:       return { bg: '#F5F5F5', color: '#666', label: status };
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <EditBidModal isVisible={editBidVisible} onClose={() => setEditBidVisible(false)} />
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={{ backgroundColor: '#4289AB', paddingHorizontal: 16, paddingVertical: 14 }}>
          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' }}>
            My Orders
          </Text>
        </View>
      </SafeAreaView>

      {/* Tab Bar */}
      <View style={{ backgroundColor: '#fff', flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab.key ? '#4289AB' : 'transparent',
            }}>
            <Text style={{
              fontFamily: activeTab === tab.key ? 'Poppins_600SemiBold' : 'Poppins_400Regular',
              fontSize: 11,
              color: activeTab === tab.key ? '#4289AB' : '#999',
            }}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 12, paddingBottom: 100, gap: 10 }}
        showsVerticalScrollIndicator={false}>

        {/* ── Bid tabs ── */}
        {activeTab !== 'purchases' && (
          filteredOrders.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Package size={56} color="#CCC" />
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#999', marginTop: 14 }}>
                No orders yet
              </Text>
            </View>
          ) : (
            filteredOrders.map((order) => {
              const badge = getStatusBadge(order.status);
              return (
                <View key={order.id} style={s.card}>
                  {/* Seller + Status Header */}
                  <View style={s.cardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Gavel size={12} color="#4289AB" />
                      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#333' }}>
                        {order.seller}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: badge.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: badge.color }}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  {/* Product Row */}
                  <View style={{ flexDirection: 'row', padding: 12, paddingTop: 4 }}>
                    <Image source={{ uri: order.imageUri }} style={{ width: 76, height: 76, borderRadius: 8, backgroundColor: '#F5F5F5' }} resizeMode="cover" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#222' }} numberOfLines={1}>
                        {order.title}
                      </Text>

                      {order.status === 'active' && order.timeRemaining && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <Clock size={11} color="#4289AB" />
                          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#4289AB' }}>
                            {order.timeRemaining} left
                          </Text>
                        </View>
                      )}

                      {order.status === 'won' && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <Trophy size={11} color="#D9AC4E" />
                          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#D9AC4E' }}>
                            You won this auction!
                          </Text>
                        </View>
                      )}

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 6 }}>
                        <View>
                          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#999' }}>Your Bid</Text>
                          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#1A2C3D' }}>
                            ₱{order.yourBid.toFixed(2)}
                          </Text>
                        </View>
                        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#999' }}>
                          {order.bidders} bidders
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Footer */}
                  <View style={s.cardFooter}>
                    {order.status === 'active' && (
                      <Pressable
                        onPress={() => setEditBidVisible(true)}
                        style={{ backgroundColor: '#4289AB', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 }}>
                        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#fff' }}>Edit Bid</Text>
                      </Pressable>
                    )}
                    {order.status === 'won' && (
                      <Pressable
                        onPress={() => router.push('/checkout')}
                        style={{ backgroundColor: '#4289AB', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 }}>
                        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#fff' }}>Pay Now</Text>
                      </Pressable>
                    )}
                    <Pressable
                      onPress={() => router.push({
                        pathname: '/(main)/ProductScreen',
                        params: {
                          id: order.id, name: order.title,
                          price: `₱${order.yourBid.toFixed(2)}`, imageUri: order.imageUri,
                          rating: '4.8', sold: String(order.bidders),
                          seller: order.seller, sellerId: order.sellerId,
                          description: order.description, category: order.category,
                        },
                      } as any)}
                      style={{ borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 }}>
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#666' }}>Details</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )
        )}

        {/* ── Purchases tab ── */}
        {activeTab === 'purchases' && (
          PURCHASES.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Package size={56} color="#CCC" />
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#999', marginTop: 14 }}>
                No purchases yet
              </Text>
            </View>
          ) : (
            PURCHASES.map((purchase) => {
              const currentStepIdx = STEP_ORDER.indexOf(purchase.status);
              return (
                <View key={purchase.id} style={s.card}>
                  {/* Header */}
                  <View style={s.cardHeader}>
                    <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#9CA3AF', letterSpacing: 0.3 }}>
                      {purchase.orderNum}
                    </Text>
                    <View style={{ backgroundColor: '#EBF5FB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: '#4289AB' }}>Processing</Text>
                    </View>
                  </View>

                  {/* Product */}
                  <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 12 }}>
                    <Image source={{ uri: purchase.imageUri }} style={{ width: 64, height: 64, borderRadius: 8 }} resizeMode="cover" />
                    <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
                      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#222' }} numberOfLines={1}>{purchase.title}</Text>
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#666', marginTop: 2 }}>{purchase.seller}</Text>
                      <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#1A2C3D', marginTop: 4 }}>₱{purchase.total}</Text>
                    </View>
                  </View>

                  {/* Mini tracker */}
                  <View style={s.trackerWrap}>
                    {PURCHASE_STEPS.map((step, i) => {
                      const done = i <= currentStepIdx;
                      return (
                        <View key={step.key} style={s.trackerStep}>
                          <View style={[s.trackerDot, done && s.trackerDotDone]}>
                            <step.icon size={10} color={done ? '#fff' : '#C0C0C0'} />
                          </View>
                          {i < PURCHASE_STEPS.length - 1 && (
                            <View style={[s.trackerLine, done && i < currentStepIdx && s.trackerLineDone]} />
                          )}
                          <Text style={[s.trackerLabel, done && { color: '#4289AB' }]}>{step.label}</Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Footer */}
                  <View style={[s.cardFooter, { justifyContent: 'space-between' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} color="#9CA3AF" />
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#6B7280' }} numberOfLines={1}>{purchase.address}</Text>
                    </View>
                    <Pressable
                      onPress={() => router.push({
                        pathname: '/(main)/TrackOrderScreen',
                        params: {
                          orderNum: purchase.orderNum,
                          title: purchase.title,
                          address: purchase.address,
                          total: purchase.total,
                          imageUri: purchase.imageUri,
                        },
                      } as any)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#4289AB' }}>Track</Text>
                      <ChevronRight size={13} color="#4289AB" />
                    </Pressable>
                  </View>
                </View>
              );
            })
          )
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 9,
    justifyContent: 'flex-end',
    gap: 8,
    alignItems: 'center',
  },
  trackerWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  trackerStep: {
    flex: 1,
    alignItems: 'center',
  },
  trackerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  trackerDotDone: {
    backgroundColor: '#4289AB',
  },
  trackerLine: {
    position: 'absolute',
    top: 12,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E5E7EB',
    zIndex: -1,
  },
  trackerLineDone: {
    backgroundColor: '#4289AB',
  },
  trackerLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
