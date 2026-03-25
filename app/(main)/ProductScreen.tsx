import React, { useState } from 'react';
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
  Star,
  ShoppingCart,
  MessageCircle,
  BadgeCheck,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  X,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Modal from 'react-native-modal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RELATED_PRODUCTS = [
  {
    id: 'r1',
    name: 'Gold Necklace',
    price: '₱220.00',
    imageUri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80',
    rating: 4.8,
  },
  {
    id: 'r2',
    name: 'Silk Scarf',
    price: '₱65.00',
    imageUri: 'https://images.unsplash.com/photo-1601924351433-2062f31a3f13?w=300&q=80',
    rating: 4.6,
  },
  {
    id: 'r3',
    name: 'Designer Belt',
    price: '₱85.00',
    imageUri: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80',
    rating: 4.7,
  },
  {
    id: 'r4',
    name: 'Retro Sunglasses',
    price: '₱45.00',
    imageUri: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&q=80',
    rating: 4.5,
  },
];

const REVIEWS = [
  {
    id: 'rv1',
    user: 'Anna Santos',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
    comment: "Amazing quality! It came with a certificate of authenticity. I can't believe I own something from my favorite celebrity.",
    date: '2 days ago',
  },
  {
    id: 'rv2',
    user: 'Marco Dela Cruz',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4,
    comment: 'Great item, well-packaged and exactly as described. The product is in excellent condition.',
    date: '1 week ago',
  },
];

type ModalMode = 'cart' | 'buynow' | null;

export default function ProductScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    price: string;
    imageUri: string;
    rating: string;
    sold: string;
    seller: string;
    sellerId: string;
    description: string;
    category: string;
    cause?: string;
    charityId?: string;
  }>();

  const { name, price, imageUri, rating, sold, seller, sellerId, description, category, cause, charityId } = params;

  const [isLuved, setIsLuved] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const ratingNum = parseFloat(rating || '4.5');
  const soldNum = parseInt(sold || '0', 10);

  const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
  const showSizes = category === 'Fashion' || category === 'Footwear';

  function openModal(mode: ModalMode) {
    setSelectedSize(null);
    setQty(1);
    setModalMode(mode);
  }

  function closeModal() {
    setModalMode(null);
  }

  function handleConfirmCart() {
    if (showSizes && !selectedSize) {
      Alert.alert('Select Size', 'Please choose a size before adding to cart.');
      return;
    }
    closeModal();
    Alert.alert('Added to Cart', `${name || 'Item'} (${selectedSize ? `Size: ${selectedSize}, ` : ''}Qty: ${qty}) has been added to your cart.`);
  }

  function handleConfirmBuyNow() {
    if (showSizes && !selectedSize) {
      Alert.alert('Select Size', 'Please choose a size before purchasing.');
      return;
    }
    closeModal();
    router.push('/checkout');
  }

  function handleShare() {
    Share.share({
      message: `Check out "${name || 'this item'}" on luvlots! ${price || ''} — Authentic celebrity pre-loved item.`,
      title: name || 'luvlots',
    });
  }

  const canConfirm = !showSizes || !!selectedSize;

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
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category || 'Item'}</Text>
          </View>
        </View>

        {/* Product Info */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.infoSection}>
          <Text style={styles.productName}>{name || 'Product'}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{price || '₱0.00'}</Text>
            {soldNum > 0 && (
              <Text style={styles.soldLabel}>{soldNum}+ sold</Text>
            )}
          </View>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                color="#FFB300"
                fill={s <= Math.round(ratingNum) ? '#FFB300' : 'transparent'}
              />
            ))}
            <Text style={styles.ratingNum}>{ratingNum}</Text>
            <Text style={styles.ratingCount}>({REVIEWS.length} reviews)</Text>
          </View>
        </Animated.View>

        {/* Charity Banner */}
        {cause && charityId && (
          <Animated.View entering={FadeInDown.delay(150).duration(500)}>
            <Pressable
              onPress={() => router.push({ pathname: '/(main)/CharityDetailScreen', params: { id: charityId } } as any)}
              style={styles.charityBanner}>
              <LinearGradient
                colors={['#1A3B56', '#2C6F91']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.charityBannerGrad}>
                <Heart size={18} color="#E91E63" fill="#E91E63" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.charityBannerLabel}>Charity Auction</Text>
                  <Text style={styles.charityBannerCause}>100% of proceeds go to <Text style={styles.charityBannerCauseBold}>{cause}</Text></Text>
                </View>
                <View style={styles.charityLearnBtn}>
                  <Text style={styles.charityLearnText}>Learn more</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

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
            onPress={() => router.push(`/(tabs)/(seller)/${sellerId || '1'}` as any)}
            style={styles.sellerRow}>
            <Image
              source={{ uri: `https://randomuser.me/api/portraits/women/${parseInt(sellerId || '1') * 11 % 99}.jpg` }}
              style={styles.sellerAvatar}
            />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.sellerName}>{seller || 'Celebrity Seller'}</Text>
                <BadgeCheck size={14} color="#4289AB" fill="#4289AB" />
              </View>
              <Text style={styles.sellerType}>Verified Celebrity Seller</Text>
            </View>
            <ChevronRight size={18} color="#CCC" />
          </Pressable>
          <Pressable style={styles.chatSellerBtn} onPress={() => router.push('/(main)/MessagesScreen' as any)}>
            <MessageCircle size={14} color="#4289AB" />
            <Text style={styles.chatSellerText}>Chat with Seller</Text>
          </Pressable>
        </Animated.View>

        {/* Reviews */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Reviews</Text>
            <Pressable onPress={() => Alert.alert('Reviews', `Showing all ${REVIEWS.length} reviews for this item.`)}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          {REVIEWS.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
              <View style={{ flex: 1 }}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{review.user}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 2, marginBottom: 4 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={11} color="#FFB300" fill={s <= review.rating ? '#FFB300' : 'transparent'} />
                  ))}
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Related */}
        <Animated.View entering={FadeInDown.delay(350).duration(500)} style={[styles.card, { paddingHorizontal: 0 }]}>
          <View style={[styles.cardHeaderRow, { paddingHorizontal: 20 }]}>
            <Text style={styles.cardTitle}>You May Also Like</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
            {RELATED_PRODUCTS.map((rel) => (
              <Pressable
                key={rel.id}
                style={styles.relatedCard}
                onPress={() => router.push({
                  pathname: '/(main)/ProductScreen',
                  params: {
                    id: rel.id,
                    name: rel.name,
                    price: rel.price,
                    imageUri: rel.imageUri,
                    rating: String(rel.rating),
                    sold: '0',
                    seller: 'Celebrity Seller',
                    sellerId: '1',
                    description: 'Authentic celebrity pre-loved item.',
                    category: 'Fashion',
                  },
                } as any)}>
                <Image source={{ uri: rel.imageUri }} style={styles.relatedImage} resizeMode="cover" />
                <View style={{ padding: 8 }}>
                  <Text style={styles.relatedName} numberOfLines={1}>{rel.name}</Text>
                  <Text style={styles.relatedPrice}>{rel.price}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Pressable onPress={() => openModal('cart')} style={styles.addToCartBtn}>
          <ShoppingCart size={18} color="#4289AB" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </Pressable>
        <Pressable onPress={() => openModal('buynow')} style={{ flex: 1 }}>
          <LinearGradient
            colors={['#4289AB', '#5BA4C4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buyNowBtn}>
            <Text style={styles.buyNowText}>Buy Now</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* ─── Variant / Quantity Modal ─── */}
      <Modal
        isVisible={modalMode !== null}
        onBackdropPress={closeModal}
        onSwipeComplete={closeModal}
        swipeDirection="down"
        style={{ justifyContent: 'flex-end', margin: 0 }}>
        <View style={styles.variantModal}>
          {/* Handle */}
          <View style={styles.modalHandle} />

          {/* Product summary row */}
          <View style={styles.modalProductRow}>
            <Image
              source={imageUri ? { uri: imageUri } : require('@/assets/images/item.png')}
              style={styles.modalProductThumb}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.modalProductName} numberOfLines={2}>{name || 'Product'}</Text>
              <Text style={styles.modalProductPrice}>{price || '₱0.00'}</Text>
              {selectedSize && (
                <Text style={styles.modalSelectedHint}>Size: {selectedSize}</Text>
              )}
            </View>
            <Pressable onPress={closeModal} style={styles.modalCloseBtn}>
              <X size={18} color="#888" />
            </Pressable>
          </View>

          <View style={styles.modalDivider} />

          {/* Size selector */}
          {showSizes && (
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>
                Size{!selectedSize && <Text style={styles.modalSectionRequired}> *required</Text>}
              </Text>
              <View style={styles.modalSizeRow}>
                {SIZES.map((size) => (
                  <Pressable
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    style={[styles.modalSizeChip, selectedSize === size && styles.modalSizeChipActive]}>
                    <Text style={[styles.modalSizeText, selectedSize === size && styles.modalSizeTextActive]}>
                      {size}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Quantity */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Quantity</Text>
            <View style={styles.qtyRow}>
              <Pressable
                onPress={() => setQty((q) => Math.max(1, q - 1))}
                style={[styles.qtyBtn, qty <= 1 && styles.qtyBtnDisabled]}>
                <Minus size={16} color={qty <= 1 ? '#CCC' : '#333'} />
              </Pressable>
              <Text style={styles.qtyValue}>{qty}</Text>
              <Pressable
                onPress={() => setQty((q) => Math.min(99, q + 1))}
                style={styles.qtyBtn}>
                <Plus size={16} color="#333" />
              </Pressable>
              <Text style={styles.qtyStock}>99 available</Text>
            </View>
          </View>

          <View style={styles.modalDivider} />

          {/* Action buttons */}
          <View style={styles.modalActions}>
            {modalMode === 'cart' ? (
              <Pressable
                onPress={handleConfirmCart}
                style={[styles.modalCartBtn, !canConfirm && { opacity: 0.5 }]}>
                <ShoppingCart size={18} color="#4289AB" />
                <Text style={styles.modalCartBtnText}>Add to Cart</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleConfirmBuyNow}
                style={[{ flex: 1 }, !canConfirm && { opacity: 0.5 }]}>
                <LinearGradient
                  colors={['#4289AB', '#5BA4C4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalBuyNowBtn}>
                  <Text style={styles.modalBuyNowText}>Buy Now</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  price: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: '#1A2C3D',
  },
  soldLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#999',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  ratingNum: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#333',
    marginLeft: 4,
  },
  ratingCount: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#999',
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
  seeAll: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#4289AB',
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
  sellerAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
  reviewItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  reviewAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewUser: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#222',
  },
  reviewDate: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#999',
  },
  reviewComment: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
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
  // Bottom bar
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
  // Variant Modal
  variantModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalProductRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalProductThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  modalProductName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#1A2C3D',
    lineHeight: 20,
    marginBottom: 4,
  },
  modalProductPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#E53935',
  },
  modalSelectedHint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#4289AB',
    marginTop: 4,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  modalSection: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  modalSectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#333',
    marginBottom: 12,
  },
  modalSectionRequired: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#E53935',
  },
  modalSizeRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  modalSizeChip: {
    width: 52,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  modalSizeChipActive: {
    borderColor: '#4289AB',
    backgroundColor: '#EFF6FA',
  },
  modalSizeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#666',
  },
  modalSizeTextActive: {
    color: '#4289AB',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  qtyBtnDisabled: {
    borderColor: '#F0F0F0',
    backgroundColor: '#F9F9F9',
  },
  qtyValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#1A2C3D',
    minWidth: 28,
    textAlign: 'center',
  },
  qtyStock: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  modalCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#4289AB',
    borderRadius: 14,
    paddingVertical: 15,
  },
  modalCartBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#4289AB',
  },
  modalBuyNowBtn: {
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBuyNowText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#fff',
  },
  charityBanner: {
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: 14,
    overflow: 'hidden',
  },
  charityBannerGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  charityBannerLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  charityBannerCause: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#fff',
    lineHeight: 16,
  },
  charityBannerCauseBold: {
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
  },
  charityLearnBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  charityLearnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#fff',
  },
});
