import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ChevronLeft, Gavel, Clock, Users } from 'lucide-react-native';

import { getLiveAuctions } from '@/lib/auctions';
import { logError } from '@/lib/observability';
import type { LiveListing } from '@/lib/listings';

function useCountdown(endsAt: string | null) {
  const [label, setLabel] = useState('--');

  useEffect(() => {
    if (!endsAt) return;
    function tick() {
      const diffMs = new Date(endsAt as string).getTime() - Date.now();
      if (diffMs <= 0) {
        setLabel('Ended');
        return;
      }
      const totalMinutes = Math.floor(diffMs / 60000);
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;
      if (days > 0) setLabel(`${days}d ${hours}h left`);
      else if (hours > 0) setLabel(`${hours}h ${minutes}m left`);
      else setLabel(`${minutes}m left`);
    }
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return label;
}

function AuctionCard({ item, index }: { item: LiveListing; index: number }) {
  const countdown = useCountdown(item.auction_ends_at);
  const currentBid = item.current_bid_amount ?? item.price;

  return (
    <Pressable
      style={s.card}
      onPress={() => router.push({ pathname: '/(main)/AuctionDetailScreen', params: { id: item.id } } as any)}>
      <Image source={{ uri: item.cover_image_url ?? undefined }} style={s.cardImage} />
      <View style={s.cardBody}>
        <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={s.cardSeller} numberOfLines={1}>
          {item.seller?.full_name ?? item.seller?.username ?? 'LUVLOTS Seller'}
        </Text>
        <View style={s.cardMetaRow}>
          <View>
            <Text style={s.bidLabel}>{item.bid_count > 0 ? 'Current Bid' : 'Starting Bid'}</Text>
            <Text style={s.bidValue}>{item.currency} {currentBid.toLocaleString()}</Text>
          </View>
          <View style={s.countdownWrap}>
            <Clock size={11} color="#D9AC4E" />
            <Text style={s.countdownText}>{countdown}</Text>
          </View>
        </View>
        <View style={s.bidCountRow}>
          <Users size={11} color="#9CA3AF" />
          <Text style={s.bidCountText}>{item.bid_count} bid{item.bid_count === 1 ? '' : 's'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function BiddingScreen() {
  const [auctions, setAuctions] = useState<LiveListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getLiveAuctions();
      setAuctions(data);
    } catch (error) {
      logError(error, { area: 'BiddingScreen.load' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <LinearGradient colors={['#1A365D', '#2C5F8A']} style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.headerRow}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <ChevronLeft size={22} color="#fff" />
            </Pressable>
            <Text style={s.headerTitle}>Live Auctions</Text>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#4289AB" size="large" />
      ) : auctions.length === 0 ? (
        <View style={s.body}>
          <View style={s.iconWrap}>
            <Gavel size={32} color="#D9AC4E" />
          </View>
          <Text style={s.title}>No Live Auctions Yet</Text>
          <Text style={s.subtitle}>
            Check back soon, or if you're a seller, start your own auction from My Products.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4289AB" />}>
          {auctions.map((item, index) => (
            <AuctionCard key={item.id} item={item} index={index} />
          ))}
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
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
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
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImage: { width: 100, height: 120, backgroundColor: '#E5E7EB' },
  cardBody: { flex: 1, padding: 12, justifyContent: 'center' },
  cardTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1A365D' },
  cardSeller: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  cardMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 },
  bidLabel: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#9CA3AF' },
  bidValue: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#4289AB', marginTop: 1 },
  countdownWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF8E7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  countdownText: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: '#B8860B' },
  bidCountRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  bidCountText: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF' },
});
