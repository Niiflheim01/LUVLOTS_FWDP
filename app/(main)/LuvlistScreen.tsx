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
import { ChevronLeft, Heart, ShoppingCart, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useAuth } from '@/lib/auth-context';
import { getMyLuvlistItems, removeFromLuvlist } from '@/lib/luvlist';
import { logError } from '@/lib/observability';
import type { Listing } from '@/types/marketplace';

type LuvlistRow = {
  id: string;
  listing_id: string;
  listings: Listing | null;
};

export default function LuvlistScreen() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<LuvlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getMyLuvlistItems();
      setItems(data as unknown as LuvlistRow[]);
    } catch (err) {
      logError(err, { area: 'LuvlistScreen.load' });
      setError('We could not load your Luvlist. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRemove(listingId: string) {
    const previous = items;
    setRemovingId(listingId);
    setItems((prev) => prev.filter((row) => row.listing_id !== listingId));

    try {
      await removeFromLuvlist(listingId);
    } catch (err) {
      logError(err, { area: 'LuvlistScreen.remove' });
      setItems(previous);
    } finally {
      setRemovingId(null);
    }
  }

  function navigateToProduct(listing: Listing) {
    router.push({
      pathname: '/(main)/ProductScreen',
      params: {
        id: listing.id,
        name: listing.title,
        price: `${listing.currency} ${listing.price.toLocaleString()}`,
        imageUri: listing.cover_image_url ?? '',
        description: listing.description ?? '',
        sellerId: listing.seller_id,
      },
    } as any);
  }

  const showSignInState = !authLoading && !user;

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>My Luvlist</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{items.length}</Text>
          </View>
        </View>
      </SafeAreaView>

      {showSignInState ? (
        <View style={styles.emptyState}>
          <Heart size={80} color="#E8D5E8" strokeWidth={1} />
          <Text style={styles.emptyTitle}>Sign in to see your Luvlist</Text>
          <Text style={styles.emptySubtitle}>
            Your saved items sync across devices once you're signed in.
          </Text>
          <Pressable onPress={() => router.push('/(auth)/Password')} style={styles.shopBtn}>
            <Text style={styles.shopBtnText}>Sign In</Text>
          </Pressable>
        </View>
      ) : loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator color="#4289AB" size="large" />
        </View>
      ) : error ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <Pressable onPress={load} style={styles.shopBtn}>
            <Text style={styles.shopBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyState}>
          <Heart size={80} color="#E8D5E8" strokeWidth={1} />
          <Text style={styles.emptyTitle}>Your Luvlist is empty</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any item to save it here for later
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/(store)')}
            style={styles.shopBtn}>
            <Text style={styles.shopBtnText}>Explore Items</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}>
          {items.map((row, index) => {
            const listing = row.listings;
            if (!listing) return null;

            return (
              <Animated.View
                key={row.id}
                entering={FadeInDown.delay(index * 70).duration(400)}>
                <Pressable
                  onPress={() => navigateToProduct(listing)}
                  style={styles.wishCard}>
                  <Image
                    source={{ uri: listing.cover_image_url ?? undefined }}
                    style={styles.wishImage}
                    resizeMode="cover"
                  />
                  <View style={styles.wishInfo}>
                    <Text style={styles.wishName} numberOfLines={2}>{listing.title}</Text>
                    {listing.condition ? (
                      <Text style={styles.wishSeller}>{listing.condition.replace('_', ' ')}</Text>
                    ) : null}
                    <Text style={styles.wishPrice}>
                      {listing.currency} {listing.price.toLocaleString()}
                    </Text>

                    <View style={styles.actionRow}>
                      <Pressable
                        onPress={() => router.push('/checkout')}
                        style={styles.addToCartBtn}>
                        <ShoppingCart size={13} color="#fff" />
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleRemove(listing.id)}
                        disabled={removingId === listing.id}
                        style={styles.removeBtn}
                        hitSlop={8}>
                        {removingId === listing.id ? (
                          <ActivityIndicator size="small" color="#CCC" />
                        ) : (
                          <Trash2 size={16} color="#CCC" />
                        )}
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#fff',
    marginLeft: 8,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  shopBtn: {
    marginTop: 24,
    backgroundColor: '#4289AB',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shopBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  wishCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  wishImage: {
    width: 110,
    height: 130,
    backgroundColor: '#EEE',
  },
  wishInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  wishName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1A1A2E',
    lineHeight: 19,
  },
  wishSeller: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#4289AB',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  wishPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    color: '#1A2C3D',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4289AB',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addToCartText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#fff',
  },
  removeBtn: {
    padding: 4,
  },
});
