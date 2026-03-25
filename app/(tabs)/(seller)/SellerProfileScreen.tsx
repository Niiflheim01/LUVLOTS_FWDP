import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Heart, Share2, Star, CheckCircle2 } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Tab = 'about' | 'product' | 'followers' | 'following';

export default function SellerProfileScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('about');

  const tabs: Tab[] = ['about', 'product', 'followers', 'following'];

  return (
    <LinearGradient
      colors={['#4289AB', '#6DAFC8', '#8FBBD8']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Cover Image */}
          <View style={s.coverContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80' }}
              style={s.coverImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)']}
              style={s.coverOverlay}
            />
            {/* Nav */}
            <View style={s.coverNav}>
              <Pressable onPress={() => router.back()} style={s.navBtn}>
                <ChevronLeft size={22} color="#fff" />
              </Pressable>
              <View style={s.navRight}>
                <Pressable style={s.navBtn}>
                  <Heart size={18} color="#fff" />
                </Pressable>
                <Pressable style={s.navBtn}>
                  <Share2 size={18} color="#fff" />
                </Pressable>
              </View>
            </View>
            {/* Avatar */}
            <View style={s.avatarWrap}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/women/23.jpg' }}
                style={s.avatar}
              />
              <View style={s.verifiedBadge}>
                <CheckCircle2 size={16} color="#fff" fill="#4CAF50" />
              </View>
            </View>
          </View>

          {/* Seller Info */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={s.infoSection}>
            <Text style={s.sellerName}>Anne Curtis</Text>
            <View style={s.statsRow}>
              <View style={s.statItem}>
                <Text style={s.statValue}>58</Text>
                <Text style={s.statLabel}>Items</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statValue}>14.2M</Text>
                <Text style={s.statLabel}>Followers</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statValue}>4.9</Text>
                <Text style={s.statLabel}>Rating</Text>
              </View>
            </View>
            <Text style={s.bio}>
              I want to make people happy. That's all I want to do.
            </Text>

            {/* Tags */}
            <View style={s.tagsRow}>
              <View style={s.tag}>
                <Star size={12} color="#D9AC4E" fill="#D9AC4E" />
                <Text style={s.tagText}>Celebrity & Influencer</Text>
              </View>
              <View style={[s.tag, { backgroundColor: '#4CAF50' }]}>
                <CheckCircle2 size={12} color="#fff" />
                <Text style={s.tagText}>Verified Seller</Text>
              </View>
            </View>
          </Animated.View>

          {/* Tabs */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={s.tabRow}>
            {tabs.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  s.tabItem,
                  activeTab === tab && s.tabItemActive,
                ]}>
                <Text
                  style={[
                    s.tabText,
                    activeTab === tab && s.tabTextActive,
                  ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </Pressable>
            ))}
          </Animated.View>

          {/* Tab Content */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={s.tabContent}>
            {activeTab === 'about' && (
              <View>
                <Text style={s.sectionTitle}>About the seller</Text>
                <Text style={s.sectionBody}>
                  Anne Gabrielle Curtis-Smith (born February 17, 1985 in Melbourne, Australia) is a
                  Filipino-Australian actress, TV host, singer, and DJ — and one of the Philippines'
                  most bankable stars. She rose to fame through ABS-CBN and has starred in
                  blockbuster films, hosted ASAP and It's Showtime, and serves as a UNICEF Philippines
                  National Ambassador.
                </Text>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80' }}
                  style={s.aboutImage}
                  resizeMode="cover"
                />
              </View>
            )}
            {activeTab === 'product' && (
              <View>
                <Text style={s.sectionTitle}>Products</Text>
                <Text style={s.placeholderText}>Product list will appear here.</Text>
              </View>
            )}
            {activeTab === 'followers' && (
              <View>
                <Text style={s.sectionTitle}>Followers</Text>
                <Text style={s.placeholderText}>Followers list will appear here.</Text>
              </View>
            )}
            {activeTab === 'following' && (
              <View>
                <Text style={s.sectionTitle}>Following</Text>
                <Text style={s.placeholderText}>Following list will appear here.</Text>
              </View>
            )}
          </Animated.View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  coverContainer: {
    height: 220,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  coverNav: {
    position: 'absolute',
    top: 8,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navRight: {
    flexDirection: 'row',
    gap: 10,
  },
  avatarWrap: {
    position: 'absolute',
    bottom: -36,
    left: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    marginTop: 44,
    paddingHorizontal: 20,
  },
  sellerName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 14,
    gap: 0,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#fff',
  },
  statLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  bio: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 21,
    marginTop: 14,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#fff',
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  tabTextActive: {
    color: '#3A7CA5',
  },
  tabContent: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#222',
    marginBottom: 10,
  },
  sectionBody: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#666',
    lineHeight: 21,
    marginBottom: 16,
  },
  aboutImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
  placeholderText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});
