import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';

import { getMyOrders } from '@/lib/orders';
import { logError } from '@/lib/observability';

type Filter = 'All' | 'Pending' | 'Paid' | 'Fulfilled';

const FILTERS: Filter[] = ['All', 'Pending', 'Paid', 'Fulfilled'];

type MyOrder = Awaited<ReturnType<typeof getMyOrders>>[number];

function matchesFilter(status: string, filter: Filter) {
  if (filter === 'All') return true;
  if (filter === 'Pending') return status === 'pending' || status === 'awaiting_payment';
  if (filter === 'Paid') return status === 'paid';
  if (filter === 'Fulfilled') return status === 'fulfilled';
  return true;
}

export default function PurchaseHistory() {
  const [filter, setFilter] = useState<Filter>('All');
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      logError(error, { area: 'PurchaseHistory.load' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = orders.filter((order) => matchesFilter(order.status, filter));

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <View style={ph.filterBar}>
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[ph.filterChip, filter === f && ph.filterChipActive]}>
            <Text style={[ph.filterChipText, filter === f && ph.filterChipTextActive]}>
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#4289AB" />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
          showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <ShoppingBag size={56} color="#CCC" />
              <Text style={ph.emptyText}>No purchases in this category</Text>
            </View>
          ) : (
            filtered.map((order) => (
              <View key={order.id} style={ph.card}>
                <View style={ph.headerRow}>
                  <Text style={ph.dateText}>{new Date(order.created_at).toLocaleDateString()}</Text>
                  <Text style={ph.countText}>{(order.order_items ?? []).length} item(s) · {order.status}</Text>
                </View>
                {(order.order_items ?? []).map((item: any) => (
                  <View key={item.id} style={ph.itemRow}>
                    <Image source={{ uri: item.listings?.cover_image_url ?? undefined }} style={ph.itemImage} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={ph.itemName} numberOfLines={1}>{item.listings?.title ?? 'Item'}</Text>
                      <Text style={ph.itemPrice}>{item.currency} {(Number(item.unit_price) * item.quantity).toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const ph = StyleSheet.create({
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F5F8FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#4289AB',
    borderColor: '#4289AB',
  },
  filterChipText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#666',
  },
  filterChipTextActive: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  emptyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1F2937' },
  countText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  itemImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#F5F5F5' },
  itemName: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#222' },
  itemPrice: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: '#1A2C3D', marginTop: 4 },
});
