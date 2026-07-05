import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Heart,
  Share2,
  ShoppingCart,
  MessageCircle,
  BadgeCheck,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useCart } from '@/lib/cart-context';
import { getLiveListings, type LiveListing } from '@/lib/listings';
import { logError } from '@/lib/observability';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    price: string;
    imageUri: string;
    seller: string;
    sellerId: string;
    description: string;
    category: string;
  }>();

  const { id, name, price, imageUri, seller, sellerId, description, category } = params;
  const { addToCart } = useCart();

  const [isLuved, setIsLuved] = useState(false);
  const [moreFromSeller, setMoreFromSeller] = useState<LiveListing[]>([]);

  const loadMoreFromSeller = useCallback(async () => {
    if (!sellerId) return;
    try {
      const listings = await getLiveListings({ sellerId, limit: 8 });
      setMoreFromSeller(listings.filter((l) => l.id !== id));
    } catch (error) {
      logError(error, { area: 'ProductScreen.loadMoreFromSeller' });
    }
  }, [sellerId, id]);

  useEffect(() => {
    loadMoreFromSeller();
  }, [loadMoreFromSeller]);

  function handleShare() {
    Share.share({
      message: `Check out "${name || 'this item'}" on luvlots! ${price || ''} — Authentic celebrity pre-loved item.`,
      title: name || 'luvlots',
    });
  }

  function handleAddToCart() {
    if (!id) {
      Alert.alert('Unavailable', 'This item is not linked to a real listing yet.');
      return;
    }
    addToCart(id);
    Alert.alert('Added to Cart', `${name || 'Item'} has been added to your cart.`);
  }

  function handleBuyNow() {
    if (!id) {
      Alert.alert('Unavailable', 'This item is not linked to a real listing yet.');
      return;
    }
    router.push({ pathname: '/checkout', params: { listingIds: id } } as any);
  }

  function navigateToRelated(item: LiveListing) {
    router.push({
      pathname: '/(main)/ProductScreen',
      params: {
        id: item.id,
        name: item.title,
        price: `${item.currency} ${item.price.toLocaleString()}`,
        imageUri: item.cover_image_url ?? '',
        seller: seller ?? '',
        sellerId: item.seller_id,
        description: item.description ?? '',
        category: item.categories?.name ?? '',
      },
    } as any);
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={imageUri ? { uri: imageUri } : require('@/assets/images/item.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.35)', 'transparent', 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />
          <SafeAreaView style={styles.navOverlay}>
            <Pressable onPress={() => router.back()} style={styles.navBtn}>
              <ChevronLeft size={22} color="#fff" />
            </Pressable>
            <View style={styles.navRight}>
              <Pressable onPress={() => setIsLuved(!isLuved)} style={styles.navBtn}>
                <Heart
                  size={20}
                  color={isLuved ? '#E91E63' : '#fff'}
                  fill={isLuved ? '#E91E63' : 'transparent'}
                />
              </Pressable>
              <Pressable style={styles.navBtn} onPress={handleShare}>
                <Share2 size={20} color="#fff" />
              </Pressable>
            </View>
          </SafeAreaView>
          {category ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category}</Text>
            </View>
          ) : null}
        </View>

        {/* Product Info */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.infoSection}>
          <Text style={styles.productName}>{name || 'Product'}</Text>
          <Text style={styles.price}>{price || '₱0.00'}</Text>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.card}>
          <Text style={styles.cardTitle}>About this Item</Text>
          <Text style={styles.description}>{description || 'Authentic pre-loved item from celebrity personal collection.'}</Text>
          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <Shield size={14} color="#4289AB" />
              <Text style={styles.trustText}>Authenticated</Text>
            </View>
            <View style={styles.trustItem}>
              <Truck size={14} color="#4289AB" />
              <Text style={styles.trustText}>Free Delivery</Text>
            </View>
            <View style={styles.trustItem}>
              <RotateCcw size={14} color="#4289AB" />
              <Text style={styles.trustText}>7-day Return</Text>
            </View>
          </View>
        </Animated.View>

        {/* Seller */}
        <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.card}>
          <Text style={styles.cardTitle}>Sold by</Text>
          <Pressable
            onPress={() => router.push(`/(tabs)/(seller)/${sellerId}` as any)}
            style={styles.sellerRow}>
            <View style={styles.sellerAvatarPlaceholder}>
              <Text style={styles.sellerAvatarInitial}>{(seller || '?').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.sellerName}>{seller || 'LUVLOTS Seller'}</Text>
                <BadgeCheck size={14} color="#4289AB" fill="#4289AB" />
              </View>
              <Text style={styles.sellerType}>LUVLOTS Seller</Text>
            </View>
            <ChevronRight size={18} color="#CCC" />
          </Pressable>
          <Pressable style={styles.chatSellerBtn} onPress={() => router.push('/(main)/MessagesScreen' as any)}>
            <MessageCircle size={14} color="#4289AB" />
            <Text style={styles.chatSellerText}>Chat with Seller</Text>
          </Pressable>
        </Animated.View>

        {/* More from this seller */}
        {moreFromSeller.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={[styles.card, { paddingHorizontal: 0 }]}>
            <View style={[styles.cardHeaderRow, { paddingHorizontal: 20 }]}>
              <Text style={styles.cardTitle}>More from this Seller</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10, alignItems: 'flex-start' }}>
              {moreFromSeller.map((rel) => (
                <Pressable key={rel.id} style={styles.relatedCard} onPress={() => navigateToRelated(rel)}>
                  <Image source={{ uri: rel.cover_image_url ?? undefined }} style={styles.relatedImage} resizeMode="cover" />
                  <View style={{ padding: 8 }}>
                    <Text style={styles.relatedName} numberOfLines={1}>{rel.title}</Text>
                    <Text style={styles.relatedPrice}>{rel.currency} {rel.price.toLocaleString()}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        ) : null}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Pressable onPress={handleAddToCart} style={styles.addToCartBtn}>
          <ShoppingCart size={18} color="#4289AB" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </Pressable>
        <Pressable onPress={handleBuyNow} style={{ flex: 1 }}>
          <LinearGradient
            colors={['#4289AB', '#5BA4C4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buyNowBtn}>
            <Text style={styles.buyNowText}>Buy Now</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F3F5',
  },
  imageContainer: {
    height: 360,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  navOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 10,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navRight: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#fff',
    letterSpacing: 0.5,
  },
  infoSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 8,
  },
  productName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#1A1A2E',
    lineHeight: 30,
  },
  price: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: '#1A2C3D',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#1A1A2E',
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#555',
    lineHeight: 21,
    marginBottom: 14,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 14,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#666',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sellerAvatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#4289AB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerAvatarInitial: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#fff',
  },
  sellerName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#222',
  },
  sellerType: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#999',
    marginTop: 1,
  },
  chatSellerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#4289AB',
    borderRadius: 10,
    paddingVertical: 10,
  },
  chatSellerText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#4289AB',
  },
  relatedCard: {
    width: 120,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  relatedImage: {
    width: 120,
    height: 120,
    backgroundColor: '#E5E7EB',
  },
  relatedName: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#333',
  },
  relatedPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#1A2C3D',
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
    gap: 10,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#4289AB',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  addToCartText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#4289AB',
  },
  buyNowBtn: {
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyNowText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#fff',
  },
});
