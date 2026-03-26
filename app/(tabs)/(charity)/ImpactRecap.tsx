import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Heart, TrendingUp, ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';

const ENDED_AUCTIONS = [
  {
    id: 'ca4',
    title: 'Signed Benefit Concert Jacket',
    cause: 'Disaster Recovery Drive',
    price: '₱11,200.00',
    finalPrice: '₱460,000',
    imageUri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    seller: 'Vice Ganda',
    sellerId: '2',
    raised: '₱460,000',
    goal: '₱450,000',
    status: 'Ended',
    category: 'Fashion',
    description: 'Charity jacket worn during a benefit show. Final proceeds were donated to post-typhoon housing assistance.',
    goalReached: true,
  },
];

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  heroBanner: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBannerText: {
    flex: 1,
    marginRight: 12,
  },
  heroBannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  heroBannerSub: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  auctionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  badgeRow: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  badgeContainer: {
    backgroundColor: '#4B5563',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  goalBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  likeBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    padding: 16,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  causeText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sellerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  sellerName: {
    fontSize: 13,
    color: '#4B5563',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
});

export default function ImpactRecapScreen() {
  const [likedIds, setLikedIds] = React.useState<string[]>([]);

  function toggleLike(id: string) {
    setLikedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  }

  function navigateToProduct(item: typeof ENDED_AUCTIONS[number]) {
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
        charityId: 'unicef',
      },
    } as any);
  }

  return (
    <View style={s.container}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Impact Recap</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <LinearGradient
          colors={['#276749', '#1F4733']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroBanner}>
          <View style={s.heroBannerText}>
            <Text style={s.heroBannerTitle}>Thanks to You</Text>
            <Text style={s.heroBannerSub}>Our community raised funds for meaningful causes</Text>
          </View>
          <TrendingUp size={48} color="#10B981" strokeWidth={1.5} />
        </LinearGradient>

        <View style={s.statsContainer}>
          <LinearGradient colors={['#EBF5FB', '#D1E7F7']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.statCard, { flex: 1 }]}>
            <Text style={[s.statValue, { color: '#0077BF' }]}>₱460K</Text>
            <Text style={s.statLabel}>Total Raised</Text>
          </LinearGradient>
          <LinearGradient colors={['#E9F7EF', '#D1F2E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.statCard, { flex: 1 }]}>
            <Text style={[s.statValue, { color: '#10B981' }]}>100%</Text>
            <Text style={s.statLabel}>Goals Achieved</Text>
          </LinearGradient>
        </View>

        <View style={s.contentContainer}>
          <Text style={s.sectionTitle}>Completed Auctions</Text>

          {ENDED_AUCTIONS.map((item, index) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(index * 100)}>
              <TouchableOpacity
                onPress={() => navigateToProduct(item)}
                style={s.auctionCard}
                activeOpacity={0.95}>
                <View style={{ position: 'relative' }}>
                  <Image source={{ uri: item.imageUri }} style={s.cardImage} resizeMode="cover" />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                    style={{ position: 'absolute', inset: 0 }}
                  />
                  <View style={s.badgeRow}>
                    <View style={s.badgeContainer}>
                      <Text style={s.badgeText}>Ended</Text>
                    </View>
                    {item.goalReached && (
                      <View style={s.goalBadge}>
                        <Text style={s.badgeText}>✓ Goal Reached</Text>
                      </View>
                    )}
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
                </View>

                <View style={s.cardBody}>
                  <Text style={s.categoryLabel}>{item.category.toUpperCase()}</Text>
                  <Text style={s.cardTitle}>{item.title}</Text>
                  <Text style={s.causeText}>{item.cause}</Text>

                  <View style={s.sellerRow}>
                    <View style={s.sellerAvatar} />
                    <Text style={s.sellerName}>{item.seller}</Text>
                  </View>

                  <View style={s.progressSection}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={s.progressLabel}>Goal: {item.goal}</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#10B981' }}>+{item.raised}</Text>
                    </View>
                    <View style={s.progressBar}>
                      <View style={[s.progressFill, { width: '100%' }]} />
                    </View>
                  </View>

                  <View style={s.priceSection}>
                    <View>
                      <Text style={s.priceLabel}>Final Amount</Text>
                      <Text style={s.priceValue}>{item.finalPrice}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
