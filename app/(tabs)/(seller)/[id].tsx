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
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Store, PackageSearch } from 'lucide-react-native';

import { getLiveListings, getSellerProfile, type LiveListing } from '@/lib/listings';
import { logError } from '@/lib/observability';

type SellerProfile = Awaited<ReturnType<typeof getSellerProfile>>;

export default function SellerStorefrontScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [listings, setListings] = useState<LiveListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [profile, sellerListings] = await Promise.all([
        getSellerProfile(id),
        getLiveListings({ sellerId: id, limit: 30 }),
      ]);
      setSeller(profile);
      setListings(sellerListings);
    } catch (err) {
      logError(err, { area: 'SellerStorefrontScreen.load' });
      setError('This seller could not be found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function navigateToProduct(item: LiveListing) {
    router.push({
      pathname: '/(main)/ProductScreen',
      params: {
        id: item.id,
        name: item.title,
        price: `${item.currency} ${item.price.toLocaleString()}`,
        imageUri: item.cover_image_url ?? '',
        seller: seller?.full_name ?? seller?.username ?? 'LUVLOTS Seller',
        sellerId: item.seller_id,
        description: item.description ?? '',
        category: item.categories?.name ?? '',
      },
    } as any);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <LinearGradient colors={['#1A365D', '#2C5F8A']} style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.headerRow}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <ChevronLeft size={22} color="#fff" />
            </Pressable>
            <Text style={s.headerTitle}>Storefront</Text>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#4289AB" />
      ) : error || !seller ? (
        <View style={s.emptyState}>
          <Text style={s.emptyText}>{error ?? 'Seller not found.'}</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={s.profileCard}>
            {seller.avatar_url ? (
              <Image source={{ uri: seller.avatar_url }} style={s.avatar} />
            ) : (
              <View style={[s.avatar, s.avatarPlaceholder]}>
                <Text style={s.avatarInitial}>
                  {(seller.full_name || seller.username || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={s.sellerName}>{seller.full_name || seller.username}</Text>
            <View style={s.roleBadge}>
              <Store size={12} color="#4289AB" />
              <Text style={s.roleBadgeText}>LUVLOTS Seller</Text>
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionTitle}>Listings ({listings.length})</Text>
            {listings.length === 0 ? (
              <View style={s.emptyListings}>
                <PackageSearch size={28} color="#CBD5E1" />
                <Text style={s.emptyListingsText}>This seller has no live listings yet.</Text>
              </View>
            ) : (
              <View style={s.grid}>
                {listings.map((item) => (
                  <Pressable key={item.id} onPress={() => navigateToProduct(item)} style={s.card}>
                    <Image source={{ uri: item.cover_image_url ?? undefined }} style={s.cardImage} resizeMode="cover" />
                    <View style={s.cardInfo}>
                      <Text style={s.cardName} numberOfLines={2}>{item.title}</Text>
                      <Text style={s.cardPrice}>{item.currency} {item.price.toLocaleString()}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
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
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280', textAlign: 'center' },
  profileCard: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 16 },
  avatar: { width: 76, height: 76, borderRadius: 38 },
  avatarPlaceholder: { backgroundColor: '#4289AB', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontFamily: 'Poppins_700Bold', fontSize: 28, color: '#fff' },
  sellerName: { fontFamily: 'Poppins_700Bold', fontSize: 17, color: '#1A365D', marginTop: 12 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EFF6FA', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 8 },
  roleBadgeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#4289AB' },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#1A365D', marginBottom: 12 },
  emptyListings: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyListingsText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardImage: { width: '100%', height: 140, backgroundColor: '#E5E7EB' },
  cardInfo: { padding: 10 },
  cardName: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#1A365D', lineHeight: 17 },
  cardPrice: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#4289AB', marginTop: 4 },
});
