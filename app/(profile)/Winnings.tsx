import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Trophy } from 'lucide-react-native';

import { getMyWonAuctions } from '@/lib/auctions';
import { logError } from '@/lib/observability';
import type { LiveListing } from '@/lib/listings';

export default function Winnings() {
  const [wins, setWins] = useState<LiveListing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getMyWonAuctions();
      setWins(data);
    } catch (error) {
      logError(error, { area: 'Winnings.load' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleCheckout(listingId: string) {
    router.push({ pathname: '/checkout', params: { listingIds: listingId } } as any);
  }

  if (loading) {
    return (
      <View style={[s.body, { justifyContent: 'center' }]}>
        <ActivityIndicator color="#4289AB" size="large" />
      </View>
    );
  }

  if (wins.length === 0) {
    return (
      <View style={s.body}>
        <View style={s.iconWrap}>
          <Trophy size={32} color="#D9AC4E" />
        </View>
        <Text style={s.title}>No Winnings Yet</Text>
        <Text style={s.subtitle}>
          Auctions you win will show up here so you can complete your purchase.
        </Text>
        <Pressable onPress={() => router.push('/(main)/BiddingScreen' as any)} style={s.browseBtn}>
          <Text style={s.browseBtnText}>Browse Live Auctions</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F8FA' }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      {wins.map((item) => (
        <View key={item.id} style={s.card}>
          <Image source={{ uri: item.cover_image_url ?? undefined }} style={s.cardImage} />
          <View style={s.cardBody}>
            <View style={s.wonBadge}>
              <Trophy size={11} color="#B8860B" />
              <Text style={s.wonBadgeText}>YOU WON</Text>
            </View>
            <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={s.cardPrice}>{item.currency} {(item.current_bid_amount ?? item.price).toLocaleString()}</Text>
            <Pressable onPress={() => handleCheckout(item.id)} style={{ marginTop: 8 }}>
              <LinearGradient colors={['#4289AB', '#2C5F8A']} style={s.checkoutBtn}>
                <Text style={s.checkoutBtnText}>Complete Purchase</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, backgroundColor: '#F5F8FA' },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#1A365D', marginBottom: 10 },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  browseBtn: { marginTop: 20, backgroundColor: '#4289AB', borderRadius: 24, paddingHorizontal: 22, paddingVertical: 12 },
  browseBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#fff' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardImage: { width: 96, height: 128, backgroundColor: '#E5E7EB' },
  cardBody: { flex: 1, padding: 12, justifyContent: 'center' },
  wonBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF8E7', alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6 },
  wonBadgeText: { fontFamily: 'Poppins_700Bold', fontSize: 9, color: '#B8860B', letterSpacing: 0.5 },
  cardTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1A365D' },
  cardPrice: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#4289AB', marginTop: 3 },
  checkoutBtn: { borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  checkoutBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#fff' },
});
