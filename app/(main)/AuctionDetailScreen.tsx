import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Clock, Gavel, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { getAuctionById, placeBid } from '@/lib/auctions';
import { useAuth } from '@/lib/auth-context';
import { logError } from '@/lib/observability';
import type { Bid, Listing, ListingImage } from '@/types/marketplace';

type AuctionDetail = Listing & {
  seller: { id: string; username: string | null; full_name: string | null; avatar_url: string | null } | null;
  images: ListingImage[];
  bids: (Bid & { bidder: { id: string; username: string | null; full_name: string | null; avatar_url: string | null } | null })[];
  categories: { name: string } | null;
};

function useCountdown(endsAt: string | null) {
  const [label, setLabel] = useState('--');
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (!endsAt) return;
    function tick() {
      const diffMs = new Date(endsAt as string).getTime() - Date.now();
      if (diffMs <= 0) {
        setLabel('Auction Ended');
        setEnded(true);
        return;
      }
      const totalMinutes = Math.floor(diffMs / 60000);
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;
      if (days > 0) setLabel(`${days}d ${hours}h ${minutes}m left`);
      else if (hours > 0) setLabel(`${hours}h ${minutes}m left`);
      else setLabel(`${minutes}m left`);
    }
    tick();
    const interval = setInterval(tick, 15000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return { label, ended };
}

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AuctionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [placing, setPlacing] = useState(false);

  const { label: countdown, ended } = useCountdown(auction?.auction_ends_at ?? null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getAuctionById(id);
      setAuction(data as AuctionDetail);
    } catch (error) {
      logError(error, { area: 'AuctionDetailScreen.load' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F2F3F5', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#4289AB" size="large" />
      </View>
    );
  }

  if (!auction) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F2F3F5', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#1A2C3D' }}>Auction not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#4289AB' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const currentBid = auction.current_bid_amount ?? auction.price;
  const minNextBid = auction.current_bid_amount != null ? auction.current_bid_amount + auction.auction_min_increment : auction.price;
  const isLive = auction.status === 'live' && !ended;
  const isSeller = user?.id === auction.seller_id;
  const isSold = auction.status === 'sold';

  async function handlePlaceBid() {
    const amount = parseFloat(bidAmount);
    if (Number.isNaN(amount) || amount < minNextBid) {
      Alert.alert('Bid too low', `Your bid must be at least ${auction!.currency} ${minNextBid.toLocaleString()}.`);
      return;
    }

    setPlacing(true);
    try {
      await placeBid(auction!.id, amount);
      setBidAmount('');
      await load();
      Alert.alert('Bid placed!', `You're now the highest bidder at ${auction!.currency} ${amount.toLocaleString()}.`);
    } catch (error) {
      logError(error, { area: 'AuctionDetailScreen.handlePlaceBid' });
      Alert.alert('Could not place bid', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={styles.imageContainer}>
          <Image
            source={auction.cover_image_url ? { uri: auction.cover_image_url } : require('@/assets/images/item.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient colors={['rgba(0,0,0,0.4)', 'transparent']} style={StyleSheet.absoluteFillObject} />
          <SafeAreaView style={styles.navOverlay}>
            <Pressable onPress={() => router.back()} style={styles.navBtn}>
              <ChevronLeft size={22} color="#fff" />
            </Pressable>
            <View style={[styles.liveBadge, !isLive && { backgroundColor: 'rgba(107,114,128,0.85)' }]}>
              <Gavel size={12} color="#fff" />
              <Text style={styles.liveBadgeText}>{isSold ? 'SOLD' : isLive ? 'LIVE AUCTION' : 'ENDED'}</Text>
            </View>
          </SafeAreaView>
        </View>

        <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.infoSection}>
          <Text style={styles.productName}>{auction.title}</Text>
          <View style={styles.bidRow}>
            <View>
              <Text style={styles.bidLabel}>{auction.bid_count > 0 ? 'Current Bid' : 'Starting Bid'}</Text>
              <Text style={styles.price}>{auction.currency} {currentBid.toLocaleString()}</Text>
            </View>
            <View style={styles.countdownWrap}>
              <Clock size={13} color="#B8860B" />
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          </View>
          <Text style={styles.bidCountText}>{auction.bid_count} bid{auction.bid_count === 1 ? '' : 's'} so far</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.card}>
          <Text style={styles.cardTitle}>About this Item</Text>
          <Text style={styles.description}>{auction.description || 'Authentic pre-loved item from a celebrity personal collection.'}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.card}>
          <Text style={styles.cardTitle}>Sold by</Text>
          <Pressable
            onPress={() => router.push(`/(tabs)/(seller)/${auction.seller_id}` as any)}
            style={styles.sellerRow}>
            <View style={styles.sellerAvatarPlaceholder}>
              <Text style={styles.sellerAvatarInitial}>
                {(auction.seller?.full_name ?? auction.seller?.username ?? '?').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerName}>{auction.seller?.full_name ?? auction.seller?.username ?? 'LUVLOTS Seller'}</Text>
              <Text style={styles.sellerType}>LUVLOTS Seller</Text>
            </View>
            <ChevronRight size={18} color="#CCC" />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.card}>
          <Text style={styles.cardTitle}>Bid History</Text>
          {auction.bids.length === 0 ? (
            <Text style={styles.noBids}>No bids yet -- be the first!</Text>
          ) : (
            auction.bids.map((bid, i) => (
              <View key={bid.id} style={styles.bidHistoryRow}>
                <View style={styles.bidderAvatarPlaceholder}>
                  <Text style={styles.bidderAvatarInitial}>
                    {(bid.bidder?.full_name ?? bid.bidder?.username ?? '?').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bidderName}>{bid.bidder?.full_name ?? bid.bidder?.username ?? 'Bidder'}</Text>
                  <Text style={styles.bidTime}>{timeAgo(bid.created_at)}</Text>
                </View>
                <Text style={[styles.bidHistoryAmount, i === 0 && { color: '#4289AB' }]}>
                  {auction.currency} {bid.amount.toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </Animated.View>
      </ScrollView>

      {!isSeller && isLive && (
        <View style={styles.bottomBar}>
          <View style={styles.bidInputRow}>
            <Text style={styles.bidInputPrefix}>{auction.currency}</Text>
            <TextInput
              style={styles.bidInput}
              placeholder={`Min. ${minNextBid.toLocaleString()}`}
              placeholderTextColor="#C4C4C4"
              keyboardType="numeric"
              value={bidAmount}
              onChangeText={setBidAmount}
            />
          </View>
          <Pressable onPress={handlePlaceBid} disabled={placing} style={{ flex: 1 }}>
            <LinearGradient colors={['#4289AB', '#5BA4C4']} style={styles.bidBtn}>
              {placing ? <ActivityIndicator color="#fff" /> : <Text style={styles.bidBtnText}>Place Bid</Text>}
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {isSeller && (
        <View style={styles.bottomBar}>
          <Text style={styles.sellerNote}>This is your listing -- you can't bid on your own auction.</Text>
        </View>
      )}

      {!isLive && !isSeller && (
        <View style={styles.bottomBar}>
          <Text style={styles.sellerNote}>
            {isSold ? 'This auction has ended. Check My Winnings if you won.' : 'This auction has ended.'}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F3F5' },
  imageContainer: { height: 340, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  navOverlay: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, zIndex: 10 },
  navBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.38)', justifyContent: 'center', alignItems: 'center' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E53935', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  liveBadgeText: { fontFamily: 'Poppins_700Bold', fontSize: 11, color: '#fff', letterSpacing: 0.5 },
  infoSection: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 18, marginBottom: 8 },
  productName: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#1A1A2E', lineHeight: 28 },
  bidRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 },
  bidLabel: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF' },
  price: { fontFamily: 'Poppins_700Bold', fontSize: 28, color: '#1A2C3D', marginTop: 2 },
  countdownWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF8E7', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  countdownText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#B8860B' },
  bidCountText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 8 },
  card: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 18, marginBottom: 8 },
  cardTitle: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#1A1A2E', marginBottom: 12 },
  description: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#555', lineHeight: 21 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sellerAvatarPlaceholder: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#4289AB', alignItems: 'center', justifyContent: 'center' },
  sellerAvatarInitial: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' },
  sellerName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#222' },
  sellerType: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#999', marginTop: 1 },
  noBids: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#9CA3AF' },
  bidHistoryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  bidderAvatarPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EFF6FA', alignItems: 'center', justifyContent: 'center' },
  bidderAvatarInitial: { fontFamily: 'Poppins_700Bold', fontSize: 12, color: '#4289AB' },
  bidderName: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#333' },
  bidTime: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#9CA3AF' },
  bidHistoryAmount: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: '#374151' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
  },
  bidInputRow: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12 },
  bidInputPrefix: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: '#9CA3AF', marginRight: 6 },
  bidInput: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1A2C3D', paddingVertical: 13 },
  bidBtn: { borderRadius: 12, height: 48, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  bidBtnText: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#fff' },
  sellerNote: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
});
