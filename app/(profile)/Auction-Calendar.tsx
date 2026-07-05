import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { CalendarDays, Clock } from 'lucide-react-native';

import { getLiveAuctions } from '@/lib/auctions';
import { logError } from '@/lib/observability';
import type { LiveListing } from '@/lib/listings';

function formatEndsAt(iso: string | null) {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' · ' + date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function AuctionCalendar() {
  const [auctions, setAuctions] = useState<LiveListing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getLiveAuctions();
      setAuctions(data);
    } catch (error) {
      logError(error, { area: 'AuctionCalendar.load' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={[s.body, { justifyContent: 'center' }]}>
        <ActivityIndicator color="#4289AB" size="large" />
      </View>
    );
  }

  if (auctions.length === 0) {
    return (
      <View style={s.body}>
        <View style={s.iconWrap}>
          <CalendarDays size={32} color="#4289AB" />
        </View>
        <Text style={s.title}>No Auctions Scheduled</Text>
        <Text style={s.subtitle}>
          Live auctions will appear here as sellers publish them -- check back soon.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F5F8FA' }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      {auctions.map((item) => (
        <Pressable
          key={item.id}
          style={s.card}
          onPress={() => router.push({ pathname: '/(main)/AuctionDetailScreen', params: { id: item.id } } as any)}>
          <Image source={{ uri: item.cover_image_url ?? undefined }} style={s.cardImage} />
          <View style={s.cardBody}>
            <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
            <View style={s.endsRow}>
              <Clock size={11} color="#9CA3AF" />
              <Text style={s.endsText}>Ends {formatEndsAt(item.auction_ends_at)}</Text>
            </View>
            <Text style={s.cardPrice}>
              {item.currency} {(item.current_bid_amount ?? item.price).toLocaleString()}
            </Text>
          </View>
        </Pressable>
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
    backgroundColor: '#EFF6FA',
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
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardImage: { width: 84, height: 96, backgroundColor: '#E5E7EB' },
  cardBody: { flex: 1, padding: 12, justifyContent: 'center' },
  cardTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1A365D' },
  endsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  endsText: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF' },
  cardPrice: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#4289AB', marginTop: 6 },
});
