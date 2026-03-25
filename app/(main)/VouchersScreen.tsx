import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Tag,
  Sparkles,
  Gift,
  Truck,
  Clock,
  CheckCircle,
} from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Voucher = {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: string;
  tag: 'New Account' | 'First Order' | 'Free Shipping' | 'Limited';
  expiresIn: string;
  minSpend?: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
};

const VOUCHERS: Voucher[] = [
  {
    id: 'v1',
    code: 'WELCOME50',
    title: 'Welcome Gift',
    description: '50% off your first purchase on luvlots. Celebrate joining our community of celebrity pre-loved finds.',
    discount: '50% OFF',
    tag: 'New Account',
    expiresIn: '7 days left',
    minSpend: 500,
    icon: Gift,
  },
  {
    id: 'v2',
    code: 'FIRSTBUY',
    title: 'First Order Discount',
    description: '₱200 off your very first order. Start your celebrity pre-loved journey the right way.',
    discount: '₱200 OFF',
    tag: 'First Order',
    expiresIn: '14 days left',
    minSpend: 1000,
    icon: Sparkles,
  },
  {
    id: 'v3',
    code: 'FREESHIP',
    title: 'Free Shipping',
    description: 'No shipping fee on any order. Applies to all items across the Philippines.',
    discount: 'FREE SHIP',
    tag: 'Free Shipping',
    expiresIn: '30 days left',
    icon: Truck,
  },
  {
    id: 'v4',
    code: 'LUVLOTS10',
    title: '10% Off Sitewide',
    description: '10% off all items in the store. Great for stocking up on your favourite celebrity pieces.',
    discount: '10% OFF',
    tag: 'Limited',
    expiresIn: '3 days left',
    minSpend: 2000,
    icon: Tag,
  },
  {
    id: 'v5',
    code: 'BIDWIN20',
    title: 'Auction Winner Reward',
    description: 'Win any auction and get 20% off your next purchase. Exclusive for auction participants.',
    discount: '20% OFF',
    tag: 'Limited',
    expiresIn: '5 days left',
    minSpend: 1500,
    icon: Sparkles,
  },
];


export default function VouchersScreen() {
  const [claimed, setClaimed] = useState<Set<string>>(new Set());

  function handleClaim(voucher: Voucher) {
    if (claimed.has(voucher.id)) {
      Alert.alert('Already Claimed', `You've already claimed "${voucher.code}". Use it at checkout!`);
      return;
    }
    setClaimed((prev) => new Set(prev).add(voucher.id));
    Alert.alert(
      'Voucher Claimed!',
      `"${voucher.code}" has been added to your voucher wallet. Apply it at checkout to save ${voucher.discount}.`,
      [{ text: 'Great!' }]
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <View style={s.header}>
          <Pressable onPress={() => router.back()} style={s.backBtn}>
            <ChevronLeft size={22} color="#fff" />
          </Pressable>
          <Text style={s.headerTitle}>Vouchers & Promos</Text>
          <View style={{ width: 38 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 }}>

        {/* Banner */}
        <Animated.View entering={FadeInDown.delay(0).duration(500)}>
          <LinearGradient
            colors={['#1A2C3D', '#2C4A63']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.banner}>
            <Tag size={28} color="#D9AC4E" />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={s.bannerTitle}>Exclusive Deals</Text>
              <Text style={s.bannerSub}>Claim vouchers below and save on celebrity pre-loved items</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <Text style={s.sectionLabel}>Available Vouchers</Text>

        {VOUCHERS.map((voucher, i) => {
          const isClaimed = claimed.has(voucher.id);
          const IconComp = voucher.icon;
          return (
            <Animated.View
              key={voucher.id}
              entering={FadeInDown.delay(80 + i * 70).duration(450)}
              style={s.card}>
              {/* Left accent strip */}
              <View style={s.cardStrip} />

              {/* Discount badge */}
              <View style={s.discountBadge}>
                <IconComp size={14} color="#fff" />
                <Text style={s.discountText}>{voucher.discount}</Text>
              </View>

              <View style={s.cardBody}>
                <View style={s.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.voucherTitle}>{voucher.title}</Text>
                    <View style={s.tagRow}>
                      <View style={s.tagPill}>
                        <Text style={s.tagText}>{voucher.tag}</Text>
                      </View>
                      <View style={s.expiryRow}>
                        <Clock size={10} color="#9CA3AF" />
                        <Text style={s.expiryText}>{voucher.expiresIn}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <Text style={s.voucherDesc} numberOfLines={2}>{voucher.description}</Text>

                {voucher.minSpend && (
                  <Text style={s.minSpendText}>Min. spend: ₱{voucher.minSpend.toLocaleString()}</Text>
                )}

                {/* Dashed separator */}
                <View style={s.dashedLine} />

                <View style={s.cardBottom}>
                  <View style={s.codeWrap}>
                    <Text style={s.codeLabel}>CODE</Text>
                    <Text style={s.codeText}>{voucher.code}</Text>
                  </View>
                  <Pressable
                    onPress={() => handleClaim(voucher)}
                    style={[s.claimBtn, isClaimed && s.claimBtnClaimed]}>
                    {isClaimed ? (
                      <>
                        <CheckCircle size={14} color="#10B981" />
                        <Text style={[s.claimBtnText, { color: '#10B981' }]}>Claimed</Text>
                      </>
                    ) : (
                      <Text style={s.claimBtnText}>Claim</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          );
        })}

        <Text style={s.footerNote}>
          Vouchers are applied at checkout. Each voucher can only be used once per account.
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    color: '#fff',
    textAlign: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  bannerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#fff',
  },
  bannerSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 3,
    lineHeight: 17,
  },
  sectionLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#1A2C3D',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardStrip: {
    width: 6,
    backgroundColor: '#4289AB',
  },
  discountBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#4289AB',
  },
  discountText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 11,
    color: '#fff',
  },
  cardBody: {
    flex: 1,
    padding: 14,
    paddingRight: 18,
  },
  cardTop: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingRight: 80,
  },
  voucherTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#1A2C3D',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  tagPill: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#EBF5FB',
  },
  tagText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#4289AB',
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  expiryText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#9CA3AF',
  },
  voucherDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 6,
  },
  minSpendText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  dashedLine: {
    borderStyle: 'dashed',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginBottom: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  codeLabel: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 9,
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  codeText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#1A2C3D',
    letterSpacing: 1,
  },
  claimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#4289AB',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  claimBtnClaimed: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  claimBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#fff',
  },
  footerNote: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
});
