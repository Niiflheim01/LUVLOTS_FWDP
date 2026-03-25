import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Heart, ShoppingCart, Star, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeOutRight } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const INITIAL_WISHLIST = [
  {
    id: 'w1',
    name: 'Luxury Handbag',
    price: '₱350.00',
    imageUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    rating: 4.9,
    sold: 48,
    seller: 'Kathryn Bernardo',
    sellerId: '3',
    description: "Authentic designer handbag from Kathryn Bernardo's personal celebrity wardrobe.",
    category: 'Fashion',
  },
  {
    id: 'w2',
    name: "It's Showtime Jacket",
    price: '₱12,000.00',
    imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
    rating: 4.6,
    sold: 21,
    seller: 'Vice Ganda',
    sellerId: '2',
    description: "Iconic stage jacket worn by Vice Ganda on It's Showtime. Certificate of authenticity included.",
    category: 'Fashion',
  },
  {
    id: 'w3',
    name: 'Diamond Ring',
    price: '₱45,000.00',
    imageUri: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80',
    rating: 4.9,
    sold: 12,
    seller: 'Ivana Alawi',
    sellerId: '5',
    description: "18k gold diamond ring from Ivana Alawi's personal jewelry collection. Appraisal certificate included.",
    category: 'Jewelry',
  },
  {
    id: 'w4',
    name: 'Limited Collab Sneakers',
    price: '₱4,200.00',
    imageUri: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    rating: 4.8,
    sold: 32,
    seller: 'Mimiyuuuh',
    sellerId: '4',
    description: 'Limited edition sneaker collab personally picked and authenticated by Mimiyuuuh.',
    category: 'Footwear',
  },
];

export default function WishlistScreen() {
  const [wishlist, setWishlist] = useState(INITIAL_WISHLIST);

  function removeItem(id: string) {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  }

  function navigateToProduct(item: typeof INITIAL_WISHLIST[number]) {
    router.push({
      pathname: '/(main)/ProductScreen',
      params: {
        id: item.id,
        name: item.name,
        price: item.price,
        imageUri: item.imageUri,
        rating: String(item.rating),
        sold: String(item.sold),
        seller: item.seller,
        sellerId: item.sellerId,
        description: item.description,
        category: item.category,
      },
    } as any);
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{wishlist.length}</Text>
          </View>
        </View>
      </SafeAreaView>

      {wishlist.length === 0 ? (
        <View style={styles.emptyState}>
          <Heart size={80} color="#E8D5E8" strokeWidth={1} />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>
            Tap the heart icon on any item to save it here for later
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/(store)')}
            style={styles.shopBtn}>
            <Text style={styles.shopBtnText}>Explore Items</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}>
          {wishlist.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(index * 70).duration(400)}>
              <Pressable
                onPress={() => navigateToProduct(item)}
                style={styles.wishCard}>
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.wishImage}
                  resizeMode="cover"
                />
                <View style={styles.wishInfo}>
                  <Text style={styles.wishName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.wishSeller}>{item.seller}</Text>
                  <View style={styles.ratingRow}>
                    <Star size={11} color="#FFB300" fill="#FFB300" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                    <Text style={styles.soldText}>{item.sold} sold</Text>
                  </View>
                  <Text style={styles.wishPrice}>{item.price}</Text>

                  {/* Actions */}
                  <View style={styles.actionRow}>
                    <Pressable
                      onPress={() => router.push('/checkout')}
                      style={styles.addToCartBtn}>
                      <ShoppingCart size={13} color="#fff" />
                      <Text style={styles.addToCartText}>Add to Cart</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => removeItem(item.id)}
                      style={styles.removeBtn}
                      hitSlop={8}>
                      <Trash2 size={16} color="#CCC" />
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#fff',
    marginLeft: 8,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  shopBtn: {
    marginTop: 24,
    backgroundColor: '#4289AB',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shopBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  wishCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  wishImage: {
    width: 110,
    height: 130,
  },
  wishInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  wishName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1A1A2E',
    lineHeight: 19,
  },
  wishSeller: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#4289AB',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#666',
  },
  soldText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#CCC',
    marginLeft: 4,
  },
  wishPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    color: '#1A2C3D',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4289AB',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addToCartText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#fff',
  },
  removeBtn: {
    padding: 4,
  },
});
