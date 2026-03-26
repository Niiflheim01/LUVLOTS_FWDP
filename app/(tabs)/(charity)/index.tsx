import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Heart, Clock, BadgeCheck, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SvgUri } from 'react-native-svg';
import { CHARITIES } from '@/app/(main)/CharityDetailScreen';

type CharityTabKey = 'partners' | 'live' | 'upcoming' | 'ended';

const CHARITY_AUCTIONS = [
  {
    id: 'ca1',
    title: 'ASAP Stage Gown',
    cause: 'Typhoon Relief Fund',
    price: '₱9,500.00',
    timeLeft: '4h 20m 10s',
    imageUri: 'https://images.unsplash.com/photo-1484327973588-c31f829103fe?w=600&q=80',
    seller: 'Anne Curtis',
    sellerId: '1',
    raised: '₱124,000',
    goal: '₱500,000',
    status: 'Live',
    category: 'Fashion',
    description: "Stunning gown worn by Anne Curtis during ASAP. Proceeds go to UNICEF Philippines typhoon relief.",
  },
  {
    id: 'ca2',
    title: 'Film Premiere Gown',
    cause: "Children's Hospital",
    price: '₱18,500.00',
    timeLeft: '1h 45m 22s',
    imageUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
    seller: 'Kathryn Bernardo',
    sellerId: '3',
    raised: '₱386,000',
    goal: '₱1,000,000',
    status: 'Live',
    category: 'Fashion',
    description: "Worn by Kathryn Bernardo at the Star Magic Film Festival. Authenticated. Proceeds to Philippine Children's Medical Center.",
  },
  {
    id: 'ca3',
    title: 'Signed MAC Collab Palette',
    cause: 'Music Education',
    price: '₱7,800.00',
    timeLeft: '12h 30m 00s',
    imageUri: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80',
    seller: 'Bretman Rock',
    sellerId: '6',
    raised: '₱92,000',
    goal: '₱300,000',
    status: 'Upcoming',
    category: 'Beauty',
    description: "Hand-signed by Bretman Rock. Proceeds benefit Cagayan de Oro scholarship programs.",
  },
  {
    id: 'ca4',
    title: 'Signed Benefit Concert Jacket',
    cause: 'Disaster Recovery Drive',
    price: '₱11,200.00',
    timeLeft: 'Ended',
    imageUri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    seller: 'Vice Ganda',
    sellerId: '2',
    raised: '₱460,000',
    goal: '₱450,000',
    status: 'Ended',
    category: 'Fashion',
    description: 'Charity jacket worn during a benefit show. Final proceeds were donated to post-typhoon housing assistance.',
  },
];

const CATEGORY_TABS: { key: CharityTabKey; label: string }[] = [
  { key: 'partners', label: 'Charity Partners' },
  { key: 'live', label: 'Live Bids' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'ended', label: 'Impact Recap' },
];

export default function CharityScreen() {
  const [activeTab, setActiveTab] = useState<CharityTabKey>('partners');
  const [likedIds, setLikedIds] = useState<string[]>([]);

  const statusByTab: Record<Exclude<CharityTabKey, 'partners'>, 'Live' | 'Upcoming' | 'Ended'> = {
    live: 'Live',
    upcoming: 'Upcoming',
    ended: 'Ended',
  };

  const filtered = activeTab === 'partners'
    ? []
    : CHARITY_AUCTIONS.filter((item) => item.status === statusByTab[activeTab]);

  function toggleLike(id: string) {
    setLikedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  }

  function navigateToBid(item: typeof CHARITY_AUCTIONS[number]) {
    router.push({
      pathname: '/(main)/BiddingScreen',
      params: {
        cause: item.cause,
        charityId: item.id === 'ca1' ? 'redcross' : item.id === 'ca2' ? 'unicef' : 'wwf',
        imageUri: item.imageUri,
        title: item.title,
      },
    } as any);
  }

  function navigateToProduct(item: typeof CHARITY_AUCTIONS[number]) {
    router.push({
      pathname: '/(main)/ProductScreen',
      params: {
        id: item.id,
        name: item.title,
        price: item.price,
        imageUri: item.imageUri,
        rating: '5.0',
        sold: '0',
        seller: item.seller,
        sellerId: item.sellerId,
        description: item.description,
        category: item.category,
        cause: item.cause,
        charityId: item.id === 'ca1' ? 'redcross' : item.id === 'ca2' ? 'unicef' : 'wwf',
      },
    } as any);
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Charity Auctions</Text>
            <Text style={s.headerSub}>Bid for a cause</Text>
          </View>
          <View style={s.totalRaisedBadge}>
            <Text style={s.totalRaisedLabel}>Total Raised</Text>
            <Text style={s.totalRaisedValue}>₱60,200</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16 }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {CATEGORY_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => {
                if (tab.key === 'upcoming') {
                  router.push('/(tabs)/(charity)/Upcoming');
                } else if (tab.key === 'ended') {
                  router.push('/(tabs)/(charity)/ImpactRecap');
                } else {
                  setActiveTab(tab.key);
                }
              }}
              style={[s.filterChip, activeTab === tab.key && s.filterChipActive]}>
              <Text style={[s.filterChipText, activeTab === tab.key && s.filterChipTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {activeTab !== 'partners' && (
          <LinearGradient
            colors={['#4289AB', '#6DAFC8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.impactBanner}>
            <Heart size={20} color="#fff" fill="#fff" />
            <Text style={s.impactText}>
              Every bid you place goes directly to real causes. Thank you for making a difference.
            </Text>
          </LinearGradient>
        )}

        {activeTab !== 'partners' && (
          <View style={{ padding: 16, gap: 16 }}>
            {filtered.length === 0 && (
              <View style={s.emptyStateCard}>
                <Text style={s.emptyStateTitle}>No auctions yet</Text>
                <Text style={s.emptyStateText}>We are preparing more items for this category. Please check back soon.</Text>
              </View>
            )}

            {filtered.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(index * 100).duration(400)}>
                <TouchableOpacity
                  onPress={() => navigateToProduct(item)}
                  style={s.auctionCard}
                  activeOpacity={0.95}>
                  <View style={{ position: 'relative' }}>
                    <Image source={{ uri: item.imageUri }} style={s.cardImage} resizeMode="cover" />
                    <View style={[
                      s.statusBadge,
                      item.status === 'Live' ? s.liveBadge : item.status === 'Upcoming' ? s.upcomingBadge : s.endedBadge,
                    ]}>
                      {item.status === 'Live' && <View style={s.liveDot} />}
                      <Text style={s.statusText}>{item.status}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleLike(item.id)}
                      style={s.likeBtn}>
                      <Heart
                        size={16}
                        color={likedIds.includes(item.id) ? '#E91E63' : '#fff'}
                        fill={likedIds.includes(item.id) ? '#E91E63' : 'transparent'}
                      />
                    </TouchableOpacity>
                    {item.status === 'Live' && (
                      <View style={s.timerOverlay}>
                        <Clock size={11} color="#fff" />
                        <Text style={s.timerText}>{item.timeLeft}</Text>
                      </View>
                    )}
                  </View>

                  <View style={s.cardBody}>
                    <View style={s.causeBadge}>
                      <Heart size={10} color="#E91E63" fill="#E91E63" />
                      <Text style={s.causeText}>{item.cause}</Text>
                    </View>

                    <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>

                    <View style={s.sellerRow}>
                      <BadgeCheck size={12} color="#4289AB" fill="#4289AB" />
                      <Text style={s.sellerName}>{item.seller}</Text>
                    </View>

                    <View style={s.progressSection}>
                      <View style={s.progressHeader}>
                        <Text style={s.raisedLabel}>Raised: <Text style={s.raisedValue}>{item.raised}</Text></Text>
                        <Text style={s.goalLabel}>Goal: {item.goal}</Text>
                      </View>
                      <View style={s.progressBar}>
                        <View style={[s.progressFill, { width: '45%' }]} />
                      </View>
                    </View>

                    <View style={s.cardFooter}>
                      <View>
                        <Text style={s.bidLabel}>Current Bid</Text>
                        <Text style={s.bidPrice}>{item.price}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => navigateToBid(item)}
                        style={s.bidBtn}>
                        <Text style={s.bidBtnText}>Place a Bid</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}

        <View style={{ paddingHorizontal: 16, marginTop: activeTab === 'partners' ? 16 : 0, marginBottom: 20 }}>
          <View style={s.partnersHeader}>
            <Text style={s.partnersTitle}>Our Charity Partners</Text>
            <Text style={s.partnersSubtitle}>Tap to learn more</Text>
          </View>
          <View style={s.partnersGrid}>
            {CHARITIES.map((charity, i) => (
              <Animated.View key={charity.id} entering={FadeInDown.delay(i * 60).duration(400)} style={{ width: '48%' }}>
                <Pressable
                  onPress={() => router.push({ pathname: '/(main)/CharityDetailScreen', params: { id: charity.id } } as any)}
                  style={({ pressed }) => [s.partnerCard, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}>
                  {/* Hero thumbnail */}
                  <Image source={{ uri: charity.heroUri }} style={s.partnerHeroImg} resizeMode="cover" />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.55)']}
                    style={s.partnerHeroGrad}
                  />
                  {/* Focus tag */}
                  <View style={[s.partnerFocusBadge, { backgroundColor: charity.focusColor }]}>
                    <Text style={s.partnerFocusText} numberOfLines={1}>{charity.focus.split('&')[0].trim()}</Text>
                  </View>
                  {/* Logo + name */}
                  <View style={s.partnerBottom}>
                    <View style={s.partnerLogoWrap}>
                      {charity.logoUri.toLowerCase().endsWith('.svg') ? (
                        <SvgUri uri={charity.logoUri} width="90%" height="90%" />
                      ) : (
                        <Image source={{ uri: charity.logoUri }} style={s.partnerLogoImg} resizeMode="contain" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.partnerName} numberOfLines={2}>{charity.name}</Text>
                      <View style={s.partnerLearnRow}>
                        <Text style={s.partnerLearnText}>Learn more</Text>
                        <ChevronRight size={10} color="#4289AB" />
                      </View>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: '#4289AB',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#fff' },
  headerSub: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  totalRaisedBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  totalRaisedLabel: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.8)' },
  totalRaisedValue: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#fff' },
  impactBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  impactText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#fff',
    flex: 1,
    lineHeight: 18,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#fff',
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
  auctionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: { width: '100%', height: 190 },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveBadge: { backgroundColor: '#E91E63' },
  upcomingBadge: { backgroundColor: '#FF9800' },
  endedBadge: { backgroundColor: '#6B7280' },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  statusText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#fff',
  },
  likeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timerText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#fff' },
  cardBody: { padding: 14 },
  causeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  causeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#E91E63',
  },
  cardTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#1A1A2E',
    marginBottom: 4,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  sellerName: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#4289AB',
  },
  progressSection: { marginBottom: 12 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  raisedLabel: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#666' },
  raisedValue: { fontFamily: 'Poppins_700Bold', color: '#222' },
  goalLabel: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#999' },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bidLabel: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#999' },
  bidPrice: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#EE4D2D' },
  bidBtn: {
    backgroundColor: '#4289AB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bidBtnText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#fff' },
  emptyStateCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5EDF2',
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  emptyStateTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1F2937',
    marginBottom: 4,
  },
  emptyStateText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  partnersHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  partnersTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#333',
  },
  partnersSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
  },
  partnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  partnerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  partnerHeroImg: {
    width: '100%',
    height: 90,
  },
  partnerHeroGrad: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  partnerFocusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    maxWidth: '80%',
  },
  partnerFocusText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 8,
    color: '#fff',
  },
  partnerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  partnerLogoWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    flexShrink: 0,
  },
  partnerLogoImg: {
    width: 28,
    height: 28,
  },
  partnerName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#1A1A2E',
    lineHeight: 13,
  },
  partnerLearnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 3,
  },
  partnerLearnText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    color: '#4289AB',
  },
});
