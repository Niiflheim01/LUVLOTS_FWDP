import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  Search,
  Bell,
  ShoppingCart,
  Heart,
  Star,
  Tag,
  ChevronRight,
  Flame,
  Sparkles,
  MessageCircle,
  PackageSearch,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, {
  FadeIn, FadeInDown, FadeInUp,
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withSpring, Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { getLiveListings, type LiveListing } from '@/lib/listings';
import { logError } from '@/lib/observability';
import { useCart } from '@/lib/cart-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


const BANNER_DATA = [
  {
    id: '1',
    colors: ['#1A3B56', '#2C6F91'] as [string, string],
    title: 'Celebrity Drops',
    subtitle: 'Own a piece of stardom',
    imageUri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&q=80',
    badge: 'EXCLUSIVE',
    badgeColor: '#D9AC4E',
    route: '/(main)/BiddingScreen',
  },
  {
    id: '2',
    colors: ['#123347', '#1A4A6E'] as [string, string],
    title: 'Charity Auctions',
    subtitle: 'Bid for a cause, win with heart',
    imageUri: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=500&q=80',
    badge: 'LIVE',
    badgeColor: '#D9AC4E',
    route: '/(tabs)/(charity)',
  },
  {
    id: '3',
    colors: ['#1D3848', '#2A5970'] as [string, string],
    title: 'Sustainable Treasures',
    subtitle: 'Pre-loved pieces, planet-conscious finds',
    imageUri: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&q=80',
    badge: 'ECO',
    badgeColor: '#D9AC4E',
    route: '/(tabs)/(seller)',
  },
  {
    id: '4',
    colors: ['#1A2F44', '#234F6E'] as [string, string],
    title: 'Designer Finds',
    subtitle: 'Authenticated luxury at your fingertips',
    imageUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80',
    badge: 'CURATED',
    badgeColor: '#D9AC4E',
    route: '/(tabs)/(seller)',
  },
  {
    id: '5',
    colors: ['#0F2233', '#1A3B56'] as [string, string],
    title: 'Curated Luxury',
    subtitle: 'Rare finds selected by our style editors',
    imageUri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=80',
    badge: 'LUXURY',
    badgeColor: '#D9AC4E',
    route: '/(main)/BiddingScreen',
  },
];

const QUICK_ACTIONS = [
  { id: '1', label: 'New\nDrops', icon: Sparkles, color: '#4289AB', route: '/(main)/BiddingScreen' as const },
  { id: '2', label: 'Charity', icon: Heart, color: '#4289AB', route: '/(tabs)/(charity)' as const },
  { id: '3', label: 'Live\nAuctions', icon: Flame, color: '#4289AB', route: '/(main)/LiveSellingScreen' as const },
  { id: '4', label: 'Sellers', icon: Star, color: '#4289AB', route: '/(tabs)/(seller)' as const },
  { id: '5', label: 'Vouchers', icon: Tag, color: '#4289AB', route: '/(main)/VouchersScreen' as const },
  { id: '6', label: 'Messages', icon: MessageCircle, color: '#4289AB', route: '/(main)/MessagesScreen' as const },
];

function navigateToProduct(item: LiveListing) {
  router.push({
    pathname: '/(main)/ProductScreen',
    params: {
      id: item.id,
      name: item.title,
      price: `${item.currency} ${item.price.toLocaleString()}`,
      imageUri: item.cover_image_url ?? '',
      seller: item.seller?.full_name ?? item.seller?.username ?? 'LUVLOTS Seller',
      sellerId: item.seller_id,
      description: item.description ?? '',
      category: item.categories?.name ?? '',
    },
  } as any);
}

function PulseDot() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.6, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1, false
    );
    opacity.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1, false
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  return <Animated.View style={[styles.liveDot, animStyle]} />;
}

/* ── Animated heart button — overlay style (on image) ── */
function LuvOverlayButton({ isLuved, onToggle }: { isLuved: boolean; onToggle: () => void }) {
  const scale = useSharedValue(1);
  const iconAnim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  function handlePress() {
    onToggle();
    scale.value = withSequence(
      withSpring(1.55, { mass: 0.15, damping: 6 }),
      withSpring(1, { mass: 0.3, damping: 12 })
    );
  }
  return (
    <Pressable onPress={handlePress} hitSlop={10} style={[styles.heartBtn, isLuved && styles.heartBtnActive]}>
      <Animated.View style={iconAnim}>
        <Heart size={16} color={isLuved ? '#E91E63' : '#fff'} fill={isLuved ? '#E91E63' : 'transparent'} />
      </Animated.View>
    </Pressable>
  );
}

/* ── Luv it button — inline card action ── */
function LuvProductButton({ isLuved, onToggle }: { isLuved: boolean; onToggle: () => void }) {
  const scale = useSharedValue(1);
  const iconAnim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  function handlePress() {
    onToggle();
    scale.value = withSequence(
      withSpring(1.5, { mass: 0.15, damping: 6 }),
      withSpring(1, { mass: 0.3, damping: 12 })
    );
  }
  return (
    <Pressable onPress={handlePress} style={[styles.luvAction, isLuved && styles.luvActionActive]}>
      <Animated.View style={iconAnim}>
        <Heart size={13} color={isLuved ? '#E91E63' : '#9CA3AF'} fill={isLuved ? '#E91E63' : 'transparent'} />
      </Animated.View>
      <Text style={[styles.luvActionText, isLuved && styles.luvActionTextActive]}>
        {isLuved ? "Luv'd!" : 'Luv it'}
      </Text>
    </Pressable>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <View style={styles.emptySection}>
      <PackageSearch size={28} color="#CBD5E1" />
      <Text style={styles.emptySectionText}>{message}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [activeBanner, setActiveBanner] = useState(0);
  const [luvItems, setLuvItems] = useState<Record<string, boolean>>({});
  const [auctionListings, setAuctionListings] = useState<LiveListing[]>([]);
  const [newArrivals, setNewArrivals] = useState<LiveListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const { listingIds: cartListingIds } = useCart();
  const cartCount = cartListingIds.length;

  const toggleLuv = useCallback((itemId: string) => {
    setLuvItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  const loadListings = useCallback(async () => {
    setLoadingListings(true);
    try {
      const [auctions, general] = await Promise.all([
        getLiveListings({ listingType: 'auction', limit: 10 }),
        getLiveListings({ limit: 20 }),
      ]);
      setAuctionListings(auctions);
      setNewArrivals(general);
    } catch (error) {
      logError(error, { area: 'HomeScreen.loadListings' });
    } finally {
      setLoadingListings(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={{ backgroundColor: '#3A7CA5' }} edges={['top']}>
        <LinearGradient
          colors={['#3A7CA5', '#4289AB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}>
          {/* Top Row: Logo + Cart + Bell */}
          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <Image
                source={require('@/assets/images/Logo_noBG.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <Text style={styles.headerBrand}>LUVLOTS</Text>
            </View>
            <View style={styles.headerIcons}>
              <Pressable
                onPress={() => router.push('/(main)/MessagesScreen' as any)}
                hitSlop={8}
                style={styles.headerIconBtn}>
                <MessageCircle size={21} color="#fff" />
              </Pressable>
              <Pressable
                onPress={() => router.push('/(profile)/Notifications' as any)}
                hitSlop={8}
                style={styles.headerIconBtn}>
                <Bell size={21} color="#fff" />
              </Pressable>
              <Pressable
                onPress={() => router.push('/(tabs)/(cart)')}
                hitSlop={8}
                style={styles.headerIconBtn}>
                <ShoppingCart size={21} color="#fff" />
                {cartCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{cartCount}</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
          {/* Search Bar */}
          <Pressable
            onPress={() => router.push('/(tabs)/(seller)' as any)}
            style={styles.searchBar}>
            <Search size={15} color="#999" />
            <Text style={styles.searchPlaceholder}>Search celebrities, items, auctions...</Text>
          </Pressable>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Banner Carousel */}
        <Animated.View entering={FadeIn.duration(600)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SCREEN_WIDTH - 36}
            snapToAlignment="start"
            decelerationRate="fast"
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 36));
              setActiveBanner(index);
            }}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12, paddingVertical: 14 }}>
            {BANNER_DATA.map((banner) => (
              <Pressable
                key={banner.id}
                onPress={() => router.push(banner.route as any)}>
                <LinearGradient
                  colors={banner.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.bannerCard}>
                  {/* Banner image on right */}
                  <View style={styles.bannerImageContainer}>
                    <Image
                      source={{ uri: banner.imageUri }}
                      style={styles.bannerImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={[banner.colors[0], 'transparent']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                  </View>
                  {/* Badge */}
                  <View style={[styles.bannerBadge, { backgroundColor: banner.badgeColor }]}>
                    <Text style={styles.bannerBadgeText}>{banner.badge}</Text>
                  </View>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                  <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                  <View style={styles.bannerShopBtn}>
                    <Text style={styles.bannerShopText}>Shop Now</Text>
                    <ChevronRight size={12} color="#fff" />
                  </View>
                </LinearGradient>
              </Pressable>
            ))}
          </ScrollView>

          {/* Banner Dots */}
          <View style={styles.dotsRow}>
            {BANNER_DATA.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, activeBanner === i && styles.dotActive]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.sectionWhite}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 6 }}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action.id}
                onPress={() => router.push(action.route as any)}
                style={styles.actionItem}>
                <View style={[styles.actionCircle, { backgroundColor: `${action.color}18` }]}>
                  <action.icon size={22} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Live Auctions */}
        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.sectionWhite}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.liveIndicator}>
                <PulseDot />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <Text style={styles.sectionTitle}>Auctions</Text>
            </View>
          </View>

          {loadingListings ? (
            <ActivityIndicator style={{ paddingVertical: 24 }} color="#4289AB" />
          ) : auctionListings.length === 0 ? (
            <EmptySection message="Live bidding auctions are coming soon." />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {auctionListings.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => navigateToProduct(item)}
                  style={({ pressed }) => [styles.auctionCard, pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 }]}>
                  <View style={{ position: 'relative' }}>
                    <Image
                      source={{ uri: item.cover_image_url ?? undefined }}
                      style={styles.auctionImage}
                      resizeMode="cover"
                    />
                    <LuvOverlayButton
                      isLuved={!!luvItems[`auction-${item.id}`]}
                      onToggle={() => toggleLuv(`auction-${item.id}`)}
                    />
                  </View>
                  <View style={styles.auctionInfo}>
                    <Text style={styles.auctionName} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.auctionPrice}>{item.currency} {item.price.toLocaleString()}</Text>
                    <View style={styles.auctionMeta}>
                      <Text style={styles.metaText} numberOfLines={1}>
                        {item.seller?.full_name ?? item.seller?.username ?? 'LUVLOTS Seller'}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </Animated.View>

        {/* New Arrivals */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.sectionWhite}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Sparkles size={17} color="#D9AC4E" />
              <Text style={styles.sectionTitle}>New Arrivals</Text>
            </View>
          </View>

          {loadingListings ? (
            <ActivityIndicator style={{ paddingVertical: 24 }} color="#4289AB" />
          ) : newArrivals.length === 0 ? (
            <EmptySection message="No listings yet — check back soon!" />
          ) : (
            <View style={styles.productGrid}>
              {newArrivals.map((item, index) => (
                <Animated.View
                  key={item.id}
                  entering={FadeInUp.delay(250 + index * 60).duration(400)}
                  style={styles.productCard}>
                  <View>
                    <Pressable
                      onPress={() => navigateToProduct(item)}
                      style={({ pressed }) => pressed && { opacity: 0.88 }}>
                      <Image
                        source={{ uri: item.cover_image_url ?? undefined }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                      <View style={styles.productInfo}>
                        <Text style={styles.productName} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.productPrice}>{item.currency} {item.price.toLocaleString()}</Text>
                        {item.categories?.name ? (
                          <Text style={styles.soldText} numberOfLines={1}>{item.categories.name}</Text>
                        ) : null}
                      </View>
                    </Pressable>
                  </View>
                  <View style={styles.productActions}>
                    <LuvProductButton
                      isLuved={!!luvItems[`product-${item.id}`]}
                      onToggle={() => toggleLuv(`product-${item.id}`)}
                    />
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3EF',
  },
  emptySection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  emptySectionText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 6,
    gap: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 28,
    height: 28,
  },
  headerBrand: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#fff',
    fontStyle: 'italic',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerIconBtn: {
    position: 'relative',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E53935',
    borderRadius: 8,
    width: 15,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#333',
  },
  searchPlaceholder: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#BCBCBC',
  },
  // Banner
  bannerCard: {
    width: SCREEN_WIDTH - 48,
    height: 148,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bannerImageContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '55%',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.55,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  bannerBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#fff',
    letterSpacing: 1,
  },
  bannerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#fff',
    lineHeight: 28,
  },
  bannerSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 3,
    maxWidth: '60%',
  },
  bannerShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 4,
  },
  bannerShopText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#fff',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D0D0D0',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#4289AB',
  },
  // Sections
  sectionWhite: {
    backgroundColor: '#FAFAF8',
    paddingVertical: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#1A1A2E',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#4289AB',
  },
  // Live indicator
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#fff',
    letterSpacing: 1,
  },
  // Quick actions
  actionItem: {
    alignItems: 'center',
    width: 68,
    paddingVertical: 4,
  },
  actionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
    lineHeight: 14,
  },
  // Auction cards
  auctionCard: {
    width: 160,
    borderRadius: 12,
    backgroundColor: '#FAFAF8',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  auctionImage: {
    width: 160,
    height: 160,
  },
  timerBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  timerText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#fff',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartBtnActive: {
    backgroundColor: 'rgba(233,30,99,0.22)',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
  },
  shareOverlayBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Product card action row
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  luvAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
  },
  luvActionActive: {
    backgroundColor: 'rgba(233,30,99,0.05)',
  },
  luvActionText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#9CA3AF',
  },
  luvActionTextActive: {
    color: '#E91E63',
  },
  productActionsDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#F0F0F0',
  },
  shareActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
  },
  shareActionBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#9CA3AF',
  },
  // Share sheet
  sheetBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  shareSheet: {
    backgroundColor: '#FAF9F7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  sharePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    gap: 4,
  },
  sharePreviewImg: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
  },
  sharePreviewTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1A1A2E',
    lineHeight: 18,
  },
  sharePreviewSub: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#1A2C3D',
    marginTop: 2,
  },
  shareToLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#374151',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  platformItem: {
    alignItems: 'center',
    gap: 6,
    width: 64,
  },
  socialIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  socialIconImg: {
    width: 38,
    height: 38,
  },
  platformIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformInitial: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
  platformLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginVertical: 12,
  },
  copyLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    marginBottom: 10,
  },
  copyLinkIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyLinkText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#374151',
  },
  sheetCancelBtn: {
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    marginTop: 4,
  },
  sheetCancelText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#6B7280',
  },
  auctionInfo: {
    padding: 10,
  },
  auctionName: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#555',
  },
  auctionPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#1A2C3D',
    marginTop: 2,
  },
  auctionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  metaText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#999',
    flex: 1,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CCC',
  },
  // Product grid
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingHorizontal: 16,
  },
  productCard: {
    width: (SCREEN_WIDTH - 46) / 2,
    borderRadius: 12,
    backgroundColor: '#FAFAF8',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 165,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#333',
    lineHeight: 17,
  },
  productPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#1A2C3D',
    marginTop: 4,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  ratingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#999',
  },
  soldText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#999',
  },
  // Trending
  trendingCard: {
    width: 140,
    borderRadius: 12,
    backgroundColor: '#FAFAF8',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
  },
  trendingImage: {
    width: 140,
    height: 140,
  },
  trendingInfo: {
    padding: 9,
  },
  trendingName: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#333',
    lineHeight: 16,
  },
  trendingPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#1A2C3D',
    marginTop: 2,
  },
});
