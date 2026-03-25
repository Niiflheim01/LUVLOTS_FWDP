import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X, Heart, Share2, ShoppingCart, Gavel, Eye, BadgeCheck, Send,
} from 'lucide-react-native';
import Animated, { FadeInLeft, FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

/* ---------- LIVE AUCTION PRODUCTS ---------- */
const LIVE_PRODUCTS: Record<string, {
  name: string; imageUri: string; startingBid: number; minBidIncrement: number;
  description: string; seller: { name: string; handle: string; avatar: string; verified: boolean; followers: string };
}> = {
  '1': {
    name: 'ASAP Stage Gown',
    imageUri: 'https://images.unsplash.com/photo-1484327973588-c31f829103fe?w=600&q=80',
    startingBid: 9500, minBidIncrement: 500,
    description: 'Stunning gown worn by Anne Curtis during ASAP live performance. Authenticated by ABS-CBN Wardrobe. Comes with certificate of authenticity.',
    seller: { name: 'Anne Curtis', handle: '@annecurtissmith', avatar: 'https://www.famousbirthdays.com/faces/curtis-anne-image.jpg', verified: true, followers: '15.1M' },
  },
  '2': {
    name: 'Iconic Fashion Set',
    imageUri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    startingBid: 6500, minBidIncrement: 300,
    description: 'Outfit worn by Mimiyuuuh in his most-viewed YouTube video with 12M+ views. Authenticated. One of a kind lewk!',
    seller: { name: 'Mimiyuuuh', handle: '@mimiyuuuh', avatar: 'https://www.famousbirthdays.com/faces/mimiyuuuh-image.jpg', verified: true, followers: '8.1M' },
  },
  '3': {
    name: 'Signed Debut Album',
    imageUri: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80',
    startingBid: 1500, minBidIncrement: 200,
    description: 'Signed physical copy of Donnalyn Bartolome\'s debut album with personalized message. Includes certificate of authenticity.',
    seller: { name: 'Donnalyn Bartolome', handle: '@donnalynbartolome', avatar: 'https://www.famousbirthdays.com/faces/bartolome-donnalyn-image.jpg', verified: true, followers: '8.6M' },
  },
  '4': {
    name: 'Diamond Ring',
    imageUri: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
    startingBid: 45000, minBidIncrement: 1000,
    description: '18k gold diamond ring from Ivana Alawi\'s personal jewelry collection. Worn in multiple vlog episodes. Appraisal certificate included.',
    seller: { name: 'Ivana Alawi', handle: '@ivanaalawi', avatar: 'https://www.famousbirthdays.com/faces/alawi-ivana-image.jpg', verified: true, followers: '19.3M' },
  },
};

const DEFAULT_PRODUCT_ID = '2';
const LIVE_PRODUCT_IDS = Object.keys(LIVE_PRODUCTS);

const COMMENT_POOL = [
  { user: 'maria_g', text: 'OMG I need this!! 😍', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
  { user: 'jake_auction', text: 'Bidding now!', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', isBid: true, bidOffset: 100 },
  { user: 'shopaholic_phl', text: 'This is so rare 🔥', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
  { user: 'rico_trades', text: 'Raising!', avatar: 'https://randomuser.me/api/portraits/men/41.jpg', isBid: true, bidOffset: 200 },
  { user: 'jess_collector', text: 'Is this authenticated? 👀', avatar: 'https://randomuser.me/api/portraits/women/55.jpg' },
  { user: 'luvlots_fan', text: 'Going higher 🚀', avatar: 'https://randomuser.me/api/portraits/men/8.jpg', isBid: true, bidOffset: 300 },
  { user: 'celine_phl', text: 'Love this seller!! 💙', avatar: 'https://randomuser.me/api/portraits/women/19.jpg' },
  { user: 'bid_hunter99', text: 'My final bid!', avatar: 'https://randomuser.me/api/portraits/men/67.jpg', isBid: true, bidOffset: 150 },
  { user: 'trish_luxe', text: 'Is this the real one?', avatar: 'https://randomuser.me/api/portraits/women/71.jpg' },
  { user: 'marc_collector', text: 'All in!! 💰', avatar: 'https://randomuser.me/api/portraits/men/14.jpg', isBid: true, bidOffset: 500 },
  { user: 'anna_shopph', text: 'Someone stop me 😭', avatar: 'https://randomuser.me/api/portraits/women/28.jpg' },
  { user: 'kiko_live', text: 'Outbidding everyone!', avatar: 'https://randomuser.me/api/portraits/men/38.jpg', isBid: true, bidOffset: 250 },
];

let commentIdCounter = 100;

interface Comment {
  id: number;
  user: string;
  text: string;
  avatar: string;
  isBid?: boolean;
}

type LiveProduct = (typeof LIVE_PRODUCTS)[keyof typeof LIVE_PRODUCTS];

function LiveSellingFeedItem({ product, isActive }: { product: LiveProduct; isActive: boolean }) {
  const seller = product.seller;

  const [comments, setComments] = useState<Comment[]>([
    { id: 1, user: 'luvlots_fan', text: 'Stream just started! 🎉', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
    { id: 2, user: 'maria_g', text: 'Can\'t wait!! 😍', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
  ]);
  const [currentBid, setCurrentBid] = useState(product.startingBid);
  const [viewerCount, setViewerCount] = useState(1243);
  const [heartCount, setHeartCount] = useState(4820);
  const [myBidText, setMyBidText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [inputMode, setInputMode] = useState<'comment' | 'bid'>('comment');
  const [isLiked, setIsLiked] = useState(false);
  const [showProduct, setShowProduct] = useState(true);
  const commentPoolIndex = useRef(0);
  const currentBidRef = useRef(product.startingBid);
  const visibleComments = comments.slice(-4);

  useEffect(() => {
    setCurrentBid(product.startingBid);
    currentBidRef.current = product.startingBid;
    setComments([
      { id: commentIdCounter++, user: 'luvlots_fan', text: 'Stream just started! 🎉', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
      { id: commentIdCounter++, user: 'maria_g', text: 'Can\'t wait!! 😍', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
    ]);
    setMyBidText('');
    setCommentText('');
    setInputMode('comment');
    setIsLiked(false);
    setShowProduct(true);
    setViewerCount(1243);
    setHeartCount(4820);
    commentPoolIndex.current = 0;
  }, [product]);

  useEffect(() => {
    currentBidRef.current = currentBid;
  }, [currentBid]);

  useEffect(() => {
    if (!isActive) return;

    const commentInterval = setInterval(() => {
      const pool = COMMENT_POOL;
      const next = pool[commentPoolIndex.current % pool.length];
      commentPoolIndex.current += 1;

      let bidText = next.text;
      let isBidComment = !!next.isBid;

      if (isBidComment) {
        // Always increment by at least one minBidIncrement, randomly 1–3×
        const multiplier = Math.floor(Math.random() * 3) + 1;
        const newBid = currentBidRef.current + multiplier * product.minBidIncrement;
        bidText = `Bidding ₱${newBid.toLocaleString()}! 🔥`;
        setCurrentBid(newBid);
        currentBidRef.current = newBid;
      }

      const newComment: Comment = {
        id: commentIdCounter++,
        user: next.user,
        text: bidText,
        avatar: next.avatar,
        isBid: isBidComment,
      };

      setComments((prev) => [...prev.slice(-30), newComment]);
    }, 3000);

    const viewerInterval = setInterval(() => {
      setViewerCount((prev) => Math.max(800, prev + Math.floor(Math.random() * 20 - 5)));
    }, 4000);

    return () => {
      clearInterval(commentInterval);
      clearInterval(viewerInterval);
    };
  }, [isActive, product.minBidIncrement]);

  const minNextBid = currentBid + product.minBidIncrement;

  function handleSendComment() {
    if (commentText.trim().length === 0) return;
    const myComment: Comment = {
      id: commentIdCounter++,
      user: 'You',
      text: commentText.trim(),
      avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
      isBid: false,
    };
    setComments((prev) => [...prev, myComment]);
    setCommentText('');
  }

  function handleBid() {
    const amount = parseInt(myBidText.replace(/[^0-9]/g, ''));
    if (!isNaN(amount) && amount >= minNextBid) {
      setCurrentBid(amount);
      currentBidRef.current = amount;
      const myComment: Comment = {
        id: commentIdCounter++,
        user: 'You',
        text: `Bidding ₱${amount.toLocaleString()}! 🔥`,
        avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
        isBid: true,
      };
      setComments((prev) => [...prev, myComment]);
      setMyBidText('');
      setInputMode('comment');
    }
  }

  function handleHeart() {
    setIsLiked(true);
    setHeartCount((prev) => prev + 1);
  }

  return (
    <View style={st.root}>
      {/* Full-screen product image background */}
      <Image
        source={{ uri: product.imageUri }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      {/* Gradient overlay: top dark → clear center → dark bottom */}
      <LinearGradient
        colors={['rgba(0,0,0,0.65)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.75)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

          {/* ─── Top Bar ─── */}
          <Animated.View entering={FadeInDown.duration(400)} style={st.topBar}>
            <View style={st.sellerPill}>
              <Image source={{ uri: seller.avatar }} style={st.sellerAvatar} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={st.sellerName} numberOfLines={1}>{seller.name}</Text>
                  {seller.verified && <BadgeCheck size={13} color="#fff" fill="#4289AB" />}
                </View>
                <Text style={st.sellerFollowers}>{seller.followers} followers</Text>
              </View>
              <Pressable style={st.followBtn}>
                <Text style={st.followBtnText}>Follow</Text>
              </Pressable>
            </View>

            <View style={st.topRight}>
              <View style={st.liveBadge}>
                <View style={st.liveDot} />
                <Text style={st.liveText}>LIVE</Text>
              </View>
              <View style={st.viewerBadge}>
                <Eye size={11} color="#fff" />
                <Text style={st.viewerText}>{viewerCount.toLocaleString()}</Text>
              </View>
              <Pressable onPress={() => router.back()} style={st.closeBtn} hitSlop={8}>
                <X size={18} color="#fff" />
              </Pressable>
            </View>
          </Animated.View>

          {/* Spacer to push content down */}
          <View style={{ flex: 1 }} />

          {/* ─── Floating Product Card ─── */}
          {showProduct && (
            <Animated.View entering={FadeInUp.delay(300).duration(500)}>
              <Pressable onPress={() => setShowProduct(false)} style={st.productCard}>
                <Image source={{ uri: product.imageUri }} style={st.productThumb} />
                <View style={{ flex: 1 }}>
                  <Text style={st.productName} numberOfLines={1}>{product.name}</Text>
                  <Text style={st.productDesc} numberOfLines={1}>{product.description}</Text>
                  <View style={st.bidRow}>
                    <View>
                      <Text style={st.bidLabel}>Current Bid</Text>
                      <Text style={st.bidAmount}>₱{currentBid.toLocaleString()}</Text>
                    </View>
                    <View style={st.minBidChip}>
                      <Gavel size={10} color="#D9AC4E" />
                      <Text style={st.minBidText}>Min +₱{product.minBidIncrement.toLocaleString()}</Text>
                    </View>
                  </View>
                </View>
                <Pressable
                  onPress={() => router.push('/(main)/BiddingScreen')}
                  style={st.bidCardBtn}>
                  <ShoppingCart size={16} color="#fff" />
                  <Text style={st.bidCardBtnText}>Bid</Text>
                </Pressable>
              </Pressable>
            </Animated.View>
          )}

          {/* ─── Live Comments ─── */}
          <View style={st.commentsArea}>
            <FlatList
              data={visibleComments}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <Animated.View
                  entering={FadeInLeft.duration(300)}
                  style={[st.commentRow, item.isBid && st.bidCommentRow]}>
                  <Image source={{ uri: item.avatar }} style={st.commentAvatar} />
                  <View style={[st.commentBubble, item.isBid && st.bidBubble]}>
                    <Text style={st.commentUser}>
                      {item.user}
                      {item.isBid && <Text style={st.bidBadgeInline}> 💰 BID</Text>}
                    </Text>
                    <Text style={[st.commentText, item.isBid && st.bidText]}>{item.text}</Text>
                  </View>
                </Animated.View>
              )}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            />
          </View>

          {/* ─── Right Action Column ─── */}
          <View style={st.rightActions}>
            <Pressable style={st.actionBtn} onPress={handleHeart}>
              <View style={st.actionCircle}>
                <Heart
                  size={22}
                  color={isLiked ? '#FF4D6D' : '#fff'}
                  fill={isLiked ? '#FF4D6D' : 'transparent'}
                />
              </View>
              <Text style={st.actionCount}>{heartCount.toLocaleString()}</Text>
            </Pressable>
            <Pressable style={st.actionBtn} onPress={() => Share.share({ message: 'Watch this live auction on luvlots!', title: 'luvlots Live' })}>
              <View style={st.actionCircle}>
                <Share2 size={20} color="#fff" />
              </View>
              <Text style={st.actionCount}>Share</Text>
            </Pressable>
            <Pressable style={st.actionBtn} onPress={() => setShowProduct(!showProduct)}>
              <View style={[st.actionCircle, { backgroundColor: 'rgba(66,137,171,0.6)' }]}>
                <ShoppingCart size={20} color="#fff" />
              </View>
              <Text style={st.actionCount}>Product</Text>
            </Pressable>
          </View>

          {/* ─── Quick bid chips (bid mode only) ─── */}
          {inputMode === 'bid' && (
            <View style={st.quickChipsRow}>
              {[1, 2, 3, 5].map((multiplier) => {
                const amt = minNextBid + (multiplier - 1) * product.minBidIncrement;
                return (
                  <Pressable
                    key={multiplier}
                    onPress={() => setMyBidText(String(amt))}
                    style={[st.quickChip, myBidText === String(amt) && st.quickChipActive]}>
                    <Text style={[st.quickChipText, myBidText === String(amt) && st.quickChipTextActive]}>
                      ₱{amt >= 1000 ? `${(amt / 1000).toFixed(amt % 1000 === 0 ? 0 : 1)}K` : amt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* ─── Bottom Bar: comment + bid ─── */}
          <View style={st.bottomBar}>
            {inputMode === 'bid' && (
              <Pressable onPress={() => { setInputMode('comment'); setMyBidText(''); }} style={st.cancelBidBtn} hitSlop={8}>
                <X size={15} color="rgba(255,255,255,0.6)" />
              </Pressable>
            )}

            <TextInput
              value={inputMode === 'comment' ? commentText : myBidText}
              onChangeText={inputMode === 'comment' ? setCommentText : setMyBidText}
              placeholder={inputMode === 'comment' ? 'Say something...' : `Min ₱${minNextBid.toLocaleString()}`}
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={st.chatInput}
              keyboardType={inputMode === 'bid' ? 'numeric' : 'default'}
              returnKeyType={inputMode === 'comment' ? 'send' : 'done'}
              onSubmitEditing={inputMode === 'comment' ? handleSendComment : handleBid}
            />

            {inputMode === 'comment' ? (
              <>
                <Pressable
                  onPress={handleSendComment}
                  style={[st.sendBtn, commentText.trim().length === 0 && { opacity: 0.4 }]}
                  hitSlop={8}>
                  <Send size={18} color="#fff" />
                </Pressable>
                <Pressable
                  onPress={() => { setInputMode('bid'); setMyBidText(''); }}
                  style={st.bidToggleBtn}>
                  <LinearGradient
                    colors={['#4289AB', '#5BA4C4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={st.bidGradient}>
                    <Gavel size={14} color="#fff" />
                    <Text style={st.bidToggleText}>Bid</Text>
                  </LinearGradient>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={handleBid}
                style={[st.bidToggleBtn, myBidText.length === 0 && { opacity: 0.5 }]}>
                <LinearGradient
                  colors={['#D9AC4E', '#F0C060']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={st.bidGradient}>
                  <Gavel size={14} color="#fff" />
                  <Text style={st.bidToggleText}>Place Bid</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

export default function LiveSellingScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();

  const initialProductId =
    productId && LIVE_PRODUCTS[productId]
      ? productId
      : DEFAULT_PRODUCT_ID;

  const initialIndex = Math.max(0, LIVE_PRODUCT_IDS.indexOf(initialProductId));
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const firstVisible = viewableItems?.[0];
    if (typeof firstVisible?.index === 'number') {
      setActiveIndex(firstVisible.index);
    }
  }).current;

  return (
    <FlatList
      data={LIVE_PRODUCT_IDS}
      keyExtractor={(item) => item}
      renderItem={({ item, index }) => (
        <View style={{ width: W, height: H }}>
          <LiveSellingFeedItem
            product={LIVE_PRODUCTS[item]}
            isActive={index === activeIndex}
          />
        </View>
      )}
      initialScrollIndex={initialIndex}
      getItemLayout={(_, index) => ({ length: H, offset: H * index, index })}
      pagingEnabled
      decelerationRate="fast"
      snapToAlignment="start"
      disableIntervalMomentum
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{ itemVisiblePercentThreshold: 70 }}
      windowSize={3}
      removeClippedSubviews
    />
  );
}

const st = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },

  /* ── Top Bar ── */
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 6,
    gap: 8,
  },
  sellerPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 28,
    paddingLeft: 4,
    paddingRight: 12,
    paddingVertical: 4,
  },
  sellerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#E53E3E',
  },
  sellerName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#fff',
    maxWidth: 100,
  },
  sellerFollowers: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    color: 'rgba(255,255,255,0.55)',
  },
  followBtn: {
    backgroundColor: '#E53935',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  followBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#fff',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53E3E',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    fontSize: 10,
    color: '#fff',
    letterSpacing: 1,
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 4,
    gap: 4,
  },
  viewerText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#fff',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Product Card ── */
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 16,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  productThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  productName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#fff',
  },
  productDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 1,
  },
  bidRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  bidLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
  },
  bidAmount: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    color: '#6DB8D8',
  },
  minBidChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(217,172,78,0.2)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  minBidText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 9,
    color: '#D9AC4E',
  },
  bidCardBtn: {
    backgroundColor: '#4289AB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  bidCardBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 10,
    color: '#fff',
  },

  /* ── Comments ── */
  commentsArea: {
    paddingHorizontal: 12,
    maxHeight: H * 0.3,
    marginBottom: 4,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 5,
    gap: 6,
  },
  bidCommentRow: {
    alignItems: 'center',
  },
  commentAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  commentBubble: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: W * 0.6,
  },
  bidBubble: {
    backgroundColor: 'rgba(66,137,171,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(109,184,216,0.4)',
  },
  commentUser: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  bidBadgeInline: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#D9AC4E',
  },
  commentText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#fff',
  },
  bidText: {
    fontFamily: 'Poppins_700Bold',
    color: '#A8D8EA',
  },

  /* ── Right Actions ── */
  rightActions: {
    position: 'absolute',
    right: 12,
    bottom: 80,
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 3,
  },
  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCount: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  /* ── Quick Bid Chips ── */
  quickChipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    paddingBottom: 6,
  },
  quickChip: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  quickChipActive: {
    backgroundColor: 'rgba(66,137,171,0.5)',
    borderColor: '#6DB8D8',
  },
  quickChipText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  quickChipTextActive: {
    color: '#fff',
  },

  /* ── Bottom Bar ── */
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 6,
    paddingTop: 6,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#fff',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBidBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bidToggleBtn: {
    overflow: 'hidden',
    borderRadius: 21,
  },
  bidGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 21,
  },
  bidToggleText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#fff',
  },
});
