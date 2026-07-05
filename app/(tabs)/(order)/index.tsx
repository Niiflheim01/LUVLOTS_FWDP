import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gavel, Package, Trophy, XCircle } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { getMyOrders } from '@/lib/orders';
import { logError } from '@/lib/observability';

type TabKey = 'active' | 'won' | 'lost' | 'purchases';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'active', label: 'Active Bids' },
  { key: 'won', label: 'Won' },
  { key: 'lost', label: 'Lost' },
  { key: 'purchases', label: 'Purchases' },
];

const COMING_SOON_COPY: Record<'active' | 'won' | 'lost', { icon: typeof Gavel; text: string }> = {
  active: { icon: Gavel, text: 'Live bidding auctions are coming soon.' },
  won: { icon: Trophy, text: "Auctions you've won will appear here once bidding launches." },
  lost: { icon: XCircle, text: 'Auctions you lost will appear here once bidding launches.' },
};

type MyOrder = Awaited<ReturnType<typeof getMyOrders>>[number];

function statusBadge(status: string) {
  switch (status) {
    case 'paid': return { bg: '#E8F5E9', color: '#2E7D32', label: 'Paid' };
    case 'fulfilled': return { bg: '#EBF5FB', color: '#4289AB', label: 'Fulfilled' };
    case 'cancelled': return { bg: '#F5F5F5', color: '#666', label: 'Cancelled' };
    case 'refunded': return { bg: '#FFEBEE', color: '#C62828', label: 'Refunded' };
    default: return { bg: '#FFF8E7', color: '#B8860B', label: 'Pending Payment' };
  }
}

export default function OrdersScreen() {
  const params = useLocalSearchParams<{ tab?: TabKey }>();
  const [activeTab, setActiveTab] = useState<TabKey>(
    params.tab && ['active', 'won', 'lost', 'purchases'].includes(params.tab) ? params.tab : 'active'
  );
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      logError(error, { area: 'OrdersScreen.load' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'purchases') load();
  }, [activeTab, load]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={{ backgroundColor: '#4289AB', paddingHorizontal: 16, paddingVertical: 14 }}>
          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' }}>
            My Orders
          </Text>
        </View>
      </SafeAreaView>

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

        {activeTab !== 'purchases' && (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            {(() => {
              const { icon: Icon, text } = COMING_SOON_COPY[activeTab];
              return (
                <>
                  <Icon size={56} color="#CCC" />
                  <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#999', marginTop: 14, textAlign: 'center', paddingHorizontal: 32 }}>
                    {text}
                  </Text>
                </>
              );
            })()}
          </View>
        )}

        {activeTab === 'purchases' && (
          loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#4289AB" />
          ) : orders.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Package size={56} color="#CCC" />
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#999', marginTop: 14 }}>
                No purchases yet
              </Text>
            </View>
          ) : (
            orders.map((order) => {
              const badge = statusBadge(order.status);
              return (
                <View key={order.id} style={s.card}>
                  <View style={s.cardHeader}>
                    <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#9CA3AF', letterSpacing: 0.3 }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </Text>
                    <View style={{ backgroundColor: badge.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: badge.color }}>{badge.label}</Text>
                    </View>
                  </View>

                  {(order.order_items ?? []).map((item: any) => (
                    <View key={item.id} style={{ flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 12 }}>
                      <Image source={{ uri: item.listings?.cover_image_url ?? undefined }} style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: '#F5F5F5' }} resizeMode="cover" />
                      <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
                        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#222' }} numberOfLines={1}>
                          {item.listings?.title ?? 'Item'}
                        </Text>
                        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#1A2C3D', marginTop: 4 }}>
                          {item.currency} {(Number(item.unit_price) * item.quantity).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  ))}

                  <View style={s.cardFooter}>
                    <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#1A2C3D' }}>
                      Total: {order.currency} {Number(order.total).toLocaleString()}
                    </Text>
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
  },
});
