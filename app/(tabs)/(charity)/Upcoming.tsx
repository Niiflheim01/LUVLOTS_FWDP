import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Heart, Clock, ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';

const UPCOMING_AUCTIONS = [
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
    description: 'Hand-signed by Bretman Rock. Proceeds benefit Cagayan de Oro scholarship programs.',
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
  headerSub: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  heroBanner: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 160,
  },
  heroBannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroBannerSub: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
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
  badgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
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
    color: '#F59E0B',
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
    backgroundColor: '#F59E0B',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

export default function UpcomingScreen() {
  const [likedIds, setLikedIds] = React.useState<string[]>([]);

  function toggleLike(id: string) {
    setLikedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  }

  function navigateToProduct(item: typeof UPCOMING_AUCTIONS[number]) {
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
          <Text style={s.headerTitle}>Upcoming Auctions</Text>
          <View style={{ width: 24 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <LinearGradient
          colors={['#4289AB', '#2E648A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroBanner}>
          <Text style={s.heroBannerTitle}>Coming Soon</Text>
          <Text style={s.heroBannerSub}>Exclusive items from your favorite personalities</Text>
        </LinearGradient>

        <View style={s.contentContainer}>
          <Text style={s.sectionTitle}>Featured Upcoming Auctions</Text>

          {UPCOMING_AUCTIONS.map((item, index) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(index * 100)}>
              <TouchableOpacity
                onPress={() => navigateToProduct(item)}
                style={s.auctionCard}
                activeOpacity={0.95}>
                <View style={{ position: 'relative' }}>
                  <Image source={{ uri: item.imageUri }} style={s.cardImage} resizeMode="cover" />
                  <View style={s.badgeContainer}>
                    <Text style={s.badgeText}>Upcoming</Text>
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
                    <Text style={s.progressLabel}>Goal: {item.goal}</Text>
                    <View style={s.progressBar}>
                      <View style={[s.progressFill, { width: '30%' }]} />
                    </View>
                  </View>

                  <View style={s.priceSection}>
                    <View>
                      <Text style={s.priceLabel}>Starting at</Text>
                      <Text style={s.priceValue}>{item.price}</Text>
                    </View>
                    <Clock size={20} color="#4289AB" />
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
