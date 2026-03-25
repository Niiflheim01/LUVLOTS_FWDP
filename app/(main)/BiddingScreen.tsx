import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Switch,
  StyleSheet,
  Dimensions,
  Share,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Plus, Minus, Clock, Heart, Share2, ChevronLeft, Gavel, Users, Star, ShieldCheck, Radio,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Modal from 'react-native-modal';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PRODUCT = {
  title: 'Retro Jacket',
  description: 'Channel timeless style with this retro jacket, featuring classic designs and bold vintage flair. A perfect blend of nostalgia and modern comfort. Comes with a certificate of authenticity.',
  imageUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
  gallery: [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80',
    'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&q=80',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&q=80',
  ],
  currentBid: 150,
  startingBid: 5.25,
  minBidIncrement: 10,
  totalBids: 12,
  year: 2022,
  seller: {
    name: 'Kathryn Bernardo',
    initials: 'KB',
    label: 'Celebrity Owner',
    avatar: 'https://randomuser.me/api/portraits/women/31.jpg',
    verified: true,
    followers: '16.3M',
  },
  endsIn: '4h 20m 10s',
};

const BIDDERS = [
  { id: 1, name: 'Maria Santos', time: '24h 34m ago', amount: '₱18,500.00', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 2, name: 'Carlo Reyes', time: '18h 12m ago', amount: '₱17,000.00', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
  { id: 3, name: 'Patricia Lim', time: '12h 5m ago', amount: '₱15,800.00', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 4, name: 'Joshua dela Cruz', time: '8h 20m ago', amount: '₱14,200.00', avatar: 'https://randomuser.me/api/portraits/men/55.jpg' },
  { id: 5, name: 'Bianca Garcia', time: '6h 1m ago', amount: '₱13,500.00', avatar: 'https://randomuser.me/api/portraits/women/15.jpg' },
];

export default function BiddingScreen() {
  const { cause, charityId } = useLocalSearchParams<{ cause?: string; charityId?: string }>();
  const [isModalVisible, setModalVisible] = useState(false);
  const [autoBid, setAutoBid] = useState(false);
  const [selectedBid, setSelectedBid] = useState(PRODUCT.currentBid + PRODUCT.minBidIncrement);
  const [bidInput, setBidInput] = useState('');
  const [isLuved, setIsLuved] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    setBidInput('');
  };
  const minBid = PRODUCT.currentBid + PRODUCT.minBidIncrement;

  const currentBidAmount = bidInput
    ? (parseInt(bidInput.replace(/[^0-9]/g, ''), 10) || 0)
    : selectedBid;
  const isValidBid = currentBidAmount >= minBid;

  const quickBids = [
    minBid,
    minBid + PRODUCT.minBidIncrement,
    minBid + PRODUCT.minBidIncrement * 2,
    minBid + PRODUCT.minBidIncrement * 5,
  ];

  function handleSelectQuickBid(amount: number) {
    setSelectedBid(amount);
    setBidInput('');
  }

  function handleConfirmBid() {
    if (!isValidBid) {
      Alert.alert('Bid Too Low', `Minimum bid is ₱${minBid.toLocaleString()}`);
      return;
    }
    toggleModal();
    Alert.alert('Bid Placed! 🎉', `Your bid of ₱${currentBidAmount.toLocaleString()} has been submitted.`, [{ text: 'OK' }]);
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* ─── Hero Image ─── */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: PRODUCT.gallery[activeImage] || PRODUCT.imageUri }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.6)']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Top navigation */}
          <SafeAreaView style={styles.imageOverlay}>
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
              <Pressable
                style={styles.navBtn}
                onPress={() => Share.share({ message: `Check out "${PRODUCT.title}" auction on luvlots! Current bid: $${PRODUCT.currentBid}`, title: PRODUCT.title })}>
                <Share2 size={20} color="#fff" />
              </Pressable>
            </View>
          </SafeAreaView>

          {/* Timer badge */}
          <View style={styles.timerOverlay}>
            <View style={styles.timerBadge}>
              <Clock size={13} color="#fff" />
              <Text style={styles.timerLabel}>Ends in</Text>
              <Text style={styles.timerValue}>{PRODUCT.endsIn}</Text>
            </View>
          </View>

          {/* LIVE indicator */}
          <View style={styles.liveOverlay}>
            <Pressable
              onPress={() => router.push({ pathname: '/(main)/LiveSellingScreen', params: { productId: '2' } } as any)}
              style={styles.livePill}>
              <Radio size={12} color="#fff" />
              <Text style={styles.livePillText}>Watch Live</Text>
            </Pressable>
          </View>
        </View>

        {/* Gallery thumbnails */}
        <View style={styles.thumbRow}>
          {PRODUCT.gallery.map((uri, i) => (
            <Pressable key={i} onPress={() => setActiveImage(i)}>
              <Image
                source={{ uri }}
                style={[styles.thumb, activeImage === i && styles.thumbActive]}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </View>

        {/* ─── Charity Banner ─── */}
        {cause && charityId && (
          <Animated.View entering={FadeInDown.delay(80).duration(450)}>
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
                  <Text style={styles.charityBannerCause}>
                    100% of proceeds go to <Text style={styles.charityBannerBold}>{cause}</Text>
                  </Text>
                </View>
                <View style={styles.charityLearnBtn}>
                  <Text style={styles.charityLearnText}>About</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {/* ─── Product Info ─── */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.infoSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={styles.productTitle}>{PRODUCT.title}</Text>
            <View style={styles.auctionBadge}>
              <Gavel size={12} color="#D9AC4E" />
              <Text style={styles.auctionBadgeText}>Auction</Text>
            </View>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.currentBidLabel}>Current Bid</Text>
            <Text style={styles.currentBidPrice}>₱{PRODUCT.currentBid.toFixed(2)}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Users size={16} color="#4289AB" />
              <Text style={styles.statValue}>{PRODUCT.totalBids}</Text>
              <Text style={styles.statLabel}>Bids</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Gavel size={16} color="#4289AB" />
              <Text style={styles.statValue}>₱{PRODUCT.startingBid.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Starting</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Star size={16} color="#D9AC4E" />
              <Text style={styles.statValue}>{PRODUCT.year}</Text>
              <Text style={styles.statLabel}>Year</Text>
            </View>
          </View>
        </Animated.View>

        {/* ─── Description Card ─── */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Description</Text>
            <Pressable>
              <Text style={styles.linkText}>All Details</Text>
            </Pressable>
          </View>
          <Text style={styles.description}>{PRODUCT.description}</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/(seller)/1')}
            style={styles.sellerRow}>
            <Image source={{ uri: PRODUCT.seller.avatar }} style={styles.sellerAvatar} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.sellerName}>{PRODUCT.seller.name}</Text>
                {PRODUCT.seller.verified && <ShieldCheck size={13} color="#4289AB" fill="#4289AB" />}
              </View>
              <Text style={styles.sellerLabel}>{PRODUCT.seller.label} · {PRODUCT.seller.followers}</Text>
            </View>
            <Pressable style={styles.visitBtn}>
              <Text style={styles.visitBtnText}>Visit</Text>
            </Pressable>
          </Pressable>
        </Animated.View>

        {/* ─── Top Bidders ─── */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Top Bidders</Text>
            <View style={styles.bidCountPill}>
              <Text style={styles.bidCountText}>{PRODUCT.totalBids} bids</Text>
            </View>
          </View>
          {BIDDERS.map((bidder, i) => (
            <View
              key={bidder.id}
              style={[styles.bidderRow, i < BIDDERS.length - 1 && styles.bidderBorder]}>
              <View style={[styles.rankCircle, i === 0 && styles.rankGold, i === 1 && styles.rankSilver, i === 2 && styles.rankBronze]}>
                <Text style={[styles.rankText, i < 3 && { color: '#fff' }]}>{i + 1}</Text>
              </View>
              <Image source={{ uri: bidder.avatar }} style={styles.bidderAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.bidderName}>{bidder.name}</Text>
                <Text style={styles.bidderTime}>{bidder.time}</Text>
              </View>
              <Text style={[styles.bidderAmount, i === 0 && { color: '#4289AB' }]}>{bidder.amount}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* ─── Bottom CTA ─── */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomInfo}>
          <Text style={styles.bottomLabel}>Current Bid</Text>
          <Text style={styles.bottomPrice}>₱{PRODUCT.currentBid.toFixed(2)}</Text>
          <Text style={styles.bottomMinLabel}>Min +₱{PRODUCT.minBidIncrement}</Text>
        </View>
        <Pressable onPress={toggleModal}>
          <LinearGradient
            colors={['#4289AB', '#5BA4C4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bidButton}>
            <Gavel size={16} color="#fff" />
            <Text style={styles.bidButtonText}>Place a Bid</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* ─── Bid Modal ─── */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        onSwipeComplete={toggleModal}
        swipeDirection="down"
        style={{ justifyContent: 'flex-end', margin: 0 }}>
        <View style={styles.modal}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Place a Bid</Text>
              <Text style={styles.modalSubtitle}>Min bid: ₱{minBid.toFixed(2)}</Text>
            </View>
            <View style={styles.modalTimer}>
              <Clock size={14} color="#4289AB" />
              <Text style={styles.modalTimerText}>{PRODUCT.endsIn}</Text>
            </View>
          </View>

          {/* Auto bid toggle */}
          <View style={styles.autoBidRow}>
            <View>
              <Text style={styles.autoBidLabel}>Auto bid</Text>
              <Text style={styles.autoBidHint}>Automatically outbid others up to your max</Text>
            </View>
            <Switch
              value={autoBid}
              onValueChange={setAutoBid}
              trackColor={{ false: '#E0E0E0', true: '#4289AB' }}
              thumbColor="#fff"
            />
          </View>

          {/* Quick amounts */}
          <View style={styles.quickBids}>
            {quickBids.map((amount) => (
              <Pressable
                key={amount}
                onPress={() => handleSelectQuickBid(amount)}
                style={[
                  styles.quickBidChip,
                  !bidInput && selectedBid === amount && styles.quickBidActive,
                ]}>
                <Text
                  style={[
                    styles.quickBidText,
                    !bidInput && selectedBid === amount && styles.quickBidTextActive,
                  ]}>
                  ₱{amount}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Custom amount input + adjuster */}
          <View style={styles.adjusterRow}>
            <Pressable
              onPress={() => {
                const cur = bidInput ? parseInt(bidInput, 10) || selectedBid : selectedBid;
                const next = Math.max(cur - PRODUCT.minBidIncrement, minBid);
                setSelectedBid(next);
                setBidInput('');
              }}
              style={styles.adjusterBtn}>
              <Minus size={20} color="#fff" />
            </Pressable>
            <View style={styles.adjusterCenter}>
              <TextInput
                value={bidInput}
                onChangeText={(t) => setBidInput(t.replace(/[^0-9]/g, ''))}
                placeholder={`₱${currentBidAmount.toLocaleString()}`}
                placeholderTextColor={isValidBid ? '#1A2C3D' : '#E53935'}
                keyboardType="numeric"
                style={[styles.adjusterInput, !isValidBid && bidInput.length > 0 && { color: '#E53935' }]}
              />
              <Text style={styles.adjusterHint}>Current bid: ₱{PRODUCT.currentBid.toFixed(2)}</Text>
              {bidInput.length > 0 && !isValidBid && (
                <Text style={styles.bidErrorText}>Min ₱{minBid.toLocaleString()}</Text>
              )}
            </View>
            <Pressable
              onPress={() => {
                const cur = bidInput ? parseInt(bidInput, 10) || selectedBid : selectedBid;
                setSelectedBid(cur + PRODUCT.minBidIncrement);
                setBidInput('');
              }}
              style={styles.adjusterBtn}>
              <Plus size={20} color="#fff" />
            </Pressable>
          </View>

          {/* Confirm button */}
          <Pressable onPress={handleConfirmBid} disabled={!isValidBid} style={{ opacity: isValidBid ? 1 : 0.5 }}>
            <LinearGradient
              colors={['#4289AB', '#5BA4C4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmBtn}>
              <Gavel size={18} color="#fff" />
              <Text style={styles.confirmBtnText}>
                Confirm Bid — ₱{isValidBid ? currentBidAmount.toLocaleString() : minBid.toLocaleString()}
              </Text>
            </LinearGradient>
          </Pressable>
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
  /* ── Hero ── */
  imageContainer: {
    height: 360,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
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
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navRight: {
    flexDirection: 'row',
    gap: 10,
  },
  timerOverlay: {
    position: 'absolute',
    bottom: 14,
    right: 14,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },
  timerLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
  },
  timerValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    color: '#fff',
  },
  liveOverlay: {
    position: 'absolute',
    bottom: 14,
    left: 14,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E53935',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  livePillText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#fff',
  },
  /* ── Thumbs ── */
  thumbRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#fff',
  },
  thumb: {
    width: 58,
    height: 58,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#E5E7EB',
  },
  thumbActive: {
    borderColor: '#4289AB',
  },
  /* ── Info ── */
  infoSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 18,
  },
  productTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#1A1A1A',
    flex: 1,
  },
  auctionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#F5E6B8',
  },
  auctionBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#D9AC4E',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginTop: 6,
  },
  currentBidLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#999',
  },
  currentBidPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#1A2C3D',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#333',
  },
  statLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#999',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  /* ── Cards ── */
  card: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginTop: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#222',
  },
  linkText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#4289AB',
  },
  bidCountPill: {
    backgroundColor: '#EFF6FA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  bidCountText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#4289AB',
  },
  description: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#666',
    lineHeight: 21,
    marginBottom: 16,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#E8F0F5',
  },
  sellerName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#333',
  },
  sellerLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#999',
    marginTop: 1,
  },
  visitBtn: {
    borderWidth: 1,
    borderColor: '#4289AB',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  visitBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#4289AB',
  },
  /* ── Bidders ── */
  bidderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  bidderBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  rankCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankGold: { backgroundColor: '#D9AC4E' },
  rankSilver: { backgroundColor: '#A0AEC0' },
  rankBronze: { backgroundColor: '#C48851' },
  rankText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#666',
  },
  bidderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  bidderName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#333',
  },
  bidderTime: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#999',
  },
  bidderAmount: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#333',
  },
  /* ── Bottom Bar ── */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomInfo: {},
  bottomLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#999',
  },
  bottomPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#1A2C3D',
  },
  bottomMinLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#999',
    marginTop: 1,
  },
  bidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  bidButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#fff',
  },
  /* ── Modal ── */
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#222',
  },
  modalSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  modalTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modalTimerText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#4289AB',
  },
  autoBidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 14,
  },
  autoBidLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#333',
  },
  autoBidHint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#999',
    marginTop: 1,
  },
  quickBids: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  quickBidChip: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  quickBidActive: {
    backgroundColor: '#4289AB',
    borderColor: '#4289AB',
  },
  quickBidText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#333',
  },
  quickBidTextActive: {
    color: '#fff',
  },
  adjusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  adjusterBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4289AB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjusterCenter: {
    alignItems: 'center',
  },
  adjusterValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 30,
    color: '#222',
  },
  adjusterInput: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: '#222',
    textAlign: 'center',
    minWidth: 160,
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#4289AB',
  },
  bidErrorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#E53935',
    marginTop: 2,
  },
  adjusterHint: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 28,
    height: 56,
  },
  confirmBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#fff',
  },
  charityBanner: {
    marginHorizontal: 16,
    marginBottom: 4,
    marginTop: 4,
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
  charityBannerBold: {
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
