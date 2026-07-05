import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, ShoppingBag } from 'lucide-react-native';
import { router } from 'expo-router';

import { useCart } from '@/lib/cart-context';
import { getListingsByIds, type LiveListing } from '@/lib/listings';
import { logError } from '@/lib/observability';

export default function CartScreen() {
  const { listingIds, removeFromCart, loaded } = useCart();
  const [listings, setListings] = useState<LiveListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!loaded) return;
    setLoading(true);
    try {
      const data = listingIds.length > 0 ? await getListingsByIds(listingIds) : [];
      setListings(data);
      setSelectedIds((prev) => {
        const stillValid = prev.filter((id) => data.some((l) => l.id === id));
        const knownIds = new Set(prev);
        const newIds = data.map((l) => l.id).filter((id) => !knownIds.has(id));
        return [...stillValid, ...newIds];
      });
    } catch (error) {
      logError(error, { area: 'CartScreen.load' });
    } finally {
      setLoading(false);
    }
  }, [listingIds, loaded]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingIds, loaded]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function handleRemove(id: string) {
    removeFromCart(id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  }

  const selectedListings = listings.filter((l) => selectedIds.includes(l.id));
  const subtotal = selectedListings.reduce((sum, l) => sum + l.price, 0);

  function handleCheckout() {
    if (selectedListings.length === 0) return;
    router.push({
      pathname: '/checkout',
      params: { listingIds: selectedListings.map((l) => l.id).join(',') },
    } as any);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={{ backgroundColor: '#4289AB', paddingHorizontal: 16, paddingVertical: 14 }}>
          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' }}>
            My Cart ({listings.length})
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 12, paddingBottom: 180, gap: 10 }}
        showsVerticalScrollIndicator={false}>
        {loading || !loaded ? (
          <ActivityIndicator style={{ marginTop: 60 }} color="#4289AB" />
        ) : listings.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <ShoppingBag size={64} color="#CCC" />
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#999', marginTop: 16 }}>
              Your cart is empty
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/(store)')}
              style={{ marginTop: 16, backgroundColor: '#4289AB', paddingHorizontal: 28, paddingVertical: 10, borderRadius: 20 }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#fff' }}>
                Shop Now
              </Text>
            </Pressable>
          </View>
        ) : (
          listings.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 3,
                elevation: 1,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6, gap: 6 }}>
                <ShoppingBag size={12} color="#4289AB" />
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#333' }} numberOfLines={1}>
                  {item.seller?.full_name ?? item.seller?.username ?? 'LUVLOTS Seller'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', padding: 12, paddingTop: 0 }}>
                <Pressable
                  onPress={() => toggleSelect(item.id)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: selectedIds.includes(item.id) ? '#4289AB' : '#DDD',
                    backgroundColor: selectedIds.includes(item.id) ? '#4289AB' : '#fff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                    marginTop: 10,
                  }}>
                  {selectedIds.includes(item.id) && (
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                  )}
                </Pressable>

                <Image
                  source={{ uri: item.cover_image_url ?? undefined }}
                  style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#F5F5F5' }}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#222' }} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.condition ? (
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#999', marginTop: 2, textTransform: 'capitalize' }}>
                      {item.condition.replace('_', ' ')}
                    </Text>
                  ) : null}
                  <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#1A2C3D', marginTop: 4 }}>
                    {item.currency} {item.price.toLocaleString()}
                  </Text>

                  <Pressable onPress={() => handleRemove(item.id)} style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Trash2 size={14} color="#CCC" />
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#999' }}>Remove</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {listings.length > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingBottom: 34,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#999' }}>
              Total ({selectedListings.length} items)
            </Text>
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#1A2C3D' }}>
              ₱{subtotal.toLocaleString()}
            </Text>
          </View>
          <Pressable
            onPress={handleCheckout}
            disabled={selectedListings.length === 0}
            style={{
              backgroundColor: selectedListings.length === 0 ? '#B0D4E8' : '#4289AB',
              paddingHorizontal: 36,
              paddingVertical: 12,
              borderRadius: 8,
            }}>
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#fff' }}>
              Check Out
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
