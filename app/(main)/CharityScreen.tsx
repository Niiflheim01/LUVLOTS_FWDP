import React, { useState } from 'react';
import { View, Text, Image, Pressable, ScrollView, StyleSheet, Dimensions, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Heart, Send, Search, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Charity = {
  title: string;
  subtitle: string;
  image: any;
  raised: number;
  goal: number;
  daysLeft?: string;
};

function CharityCard({ charity }: { charity: Charity }) {
  const percentage = Math.min(100, Math.round((charity.raised / charity.goal) * 100));

  return (
    <View style={styles.charityCard}>
      {/* Image */}
      <View style={{ position: 'relative' }}>
        <Image source={charity.image} style={styles.charityImage} resizeMode="cover" />
        {charity.daysLeft ? (
          <View style={styles.daysLeftBadge}>
            <Clock size={12} color="#333" />
            <Text style={styles.daysLeftText}>{charity.daysLeft}</Text>
          </View>
        ) : null}
        <View style={styles.charityImageActions}>
          <Pressable style={styles.charityActionBtn}>
            <Heart size={14} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Info */}
      <View style={styles.charityInfo}>
        <Text style={styles.charityTitle}>{charity.title}</Text>
        <Text style={styles.charitySubtitle}>{charity.subtitle}</Text>

        {/* Progress */}
        <View style={styles.progressRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${percentage}%` }]} />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.raisedText}>₱{charity.raised.toLocaleString()}</Text>
              <Text style={styles.goalText}>₱{charity.goal.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.percentCircle}>
            <Text style={styles.percentText}>{percentage}%</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.charityActions}>
          <Pressable style={styles.donateBtn}>
            <LinearGradient
              colors={['#4289AB', '#5BA4C4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.donateBtnGradient}>
              <Text style={styles.donateBtnText}>Donate Now</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.shareBtn} onPress={() => Share.share({ message: `Support "${charity.title}" on luvlots Charity! Help us reach our goal.`, title: charity.title })}>
            <Send size={16} color="#4289AB" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function LatestCharityCard({ title, raised, time }: { title: string; raised: number; time: string }) {
  return (
    <Pressable style={styles.latestCard}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200&q=80' }}
        style={styles.latestImage}
        resizeMode="cover"
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.latestTitle}>{title}</Text>
        <View style={styles.latestProgressBar}>
          <View style={[styles.latestProgressFill, { width: '66%' }]} />
        </View>
        <Text style={styles.latestRaised}>₱{raised.toLocaleString()} Raised</Text>
      </View>
      <View style={styles.latestRight}>
        <View style={styles.latestTimeRow}>
          <Clock size={12} color="#999" />
          <Text style={styles.latestTime}>{time}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function CharityScreen() {
  const [activeTab, setActiveTab] = useState('Explore');

  const ongoingCharity: Charity = {
    title: 'Fund Coconut Trees',
    subtitle: 'Boost the Philippine Economy',
    image: { uri: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80' },
    raised: 105000,
    goal: 210000,
    daysLeft: '2 Days Left',
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: '#4289AB' }} edges={['top']}>
        <LinearGradient colors={['#4289AB', '#4E93B5']} style={styles.header}>
          <Text style={styles.headerTitle}>Charity</Text>
          <View style={styles.searchBarSmall}>
            <Search size={15} color="#999" />
            <Text style={styles.searchPlaceholder}>Search charities...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {['Explore', 'Popular', 'Newest'].map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        {/* Ongoing */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ongoing Charity</Text>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.seeAll}>See All</Text>
              <ChevronRight size={14} color="#4289AB" />
            </Pressable>
          </View>
          <CharityCard charity={ongoingCharity} />
        </Animated.View>

        {/* Latest */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Text style={styles.sectionTitle}>Latest Charity</Text>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.seeAll}>See All</Text>
              <ChevronRight size={14} color="#4289AB" />
            </Pressable>
          </View>
          <LatestCharityCard title="Plant More Trees" raised={20000} time="4h 20m" />
          <LatestCharityCard title="Build School Library" raised={45000} time="1d 6h" />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F3F5',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#fff',
    marginBottom: 10,
  },
  searchBarSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 36,
    gap: 8,
  },
  searchPlaceholder: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#BCBCBC',
  },
  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4289AB',
  },
  tabText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#999',
  },
  tabTextActive: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#4289AB',
  },
  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#222',
  },
  seeAll: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#4289AB',
  },
  // Charity Card
  charityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  charityImage: {
    width: '100%',
    height: 180,
  },
  daysLeftBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  daysLeftText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#333',
  },
  charityImageActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  charityActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  charityInfo: {
    padding: 16,
  },
  charityTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#222',
  },
  charitySubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  raisedText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#4CAF50',
  },
  goalText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#999',
  },
  percentCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: '#4289AB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#4289AB',
  },
  charityActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  donateBtn: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  donateBtnGradient: {
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  donateBtnText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#fff',
  },
  shareBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#4289AB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Latest card
  latestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  latestImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  latestTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#333',
  },
  latestProgressBar: {
    height: 5,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  latestProgressFill: {
    height: 5,
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  latestRaised: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 3,
  },
  latestRight: {
    alignItems: 'flex-end',
  },
  latestTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  latestTime: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#999',
  },
});
