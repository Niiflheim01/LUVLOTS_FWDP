import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Search, Star, ChevronRight, BadgeCheck, Leaf, Gem } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const SELLERS = [
  {
    id: '1',
    name: 'Anne Curtis',
    type: 'Celebrity',
    category: 'celebrity',
    isCelebrity: true,
    followers: '15.1M',
    rating: 4.9,
    products: 58,
    avatarUri: 'https://www.famousbirthdays.com/faces/curtis-anne-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
  },
  {
    id: '2',
    name: 'Vice Ganda',
    type: 'Celebrity',
    category: 'celebrity',
    isCelebrity: true,
    followers: '8.2M',
    rating: 4.8,
    products: 43,
    avatarUri: 'https://www.famousbirthdays.com/faces/ganda-vice-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=600&q=80',
  },
  {
    id: '3',
    name: 'Kathryn Bernardo',
    type: 'Celebrity',
    category: 'celebrity',
    isCelebrity: true,
    followers: '17.4M',
    rating: 4.9,
    products: 71,
    avatarUri: 'https://www.famousbirthdays.com/faces/bernardo-kathryn-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
  },
  {
    id: '4',
    name: 'Mimiyuuuh',
    type: 'Influencer',
    category: 'celebrity',
    isCelebrity: true,
    followers: '8.1M',
    rating: 4.7,
    products: 35,
    avatarUri: 'https://www.famousbirthdays.com/faces/mimiyuuuh-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80',
  },
  {
    id: '5',
    name: 'Ivana Alawi',
    type: 'Celebrity',
    category: 'celebrity',
    isCelebrity: true,
    followers: '19.3M',
    rating: 5.0,
    products: 89,
    avatarUri: 'https://www.famousbirthdays.com/faces/alawi-ivana-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80',
  },
  {
    id: '6',
    name: 'Bretman Rock',
    type: 'Influencer',
    category: 'celebrity',
    isCelebrity: true,
    followers: '18.7M',
    rating: 4.8,
    products: 47,
    avatarUri: 'https://www.famousbirthdays.com/faces/rock-bretman-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
  },
  {
    id: '7',
    name: 'Alex Gonzaga',
    type: 'Celebrity',
    category: 'celebrity',
    isCelebrity: true,
    followers: '12.4M',
    rating: 4.7,
    products: 38,
    avatarUri: 'https://www.famousbirthdays.com/faces/gonzaga-alex-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
  },
  {
    id: '8',
    name: 'Donnalyn Bartolome',
    type: 'Influencer',
    category: 'celebrity',
    isCelebrity: true,
    followers: '8.6M',
    rating: 4.6,
    products: 22,
    avatarUri: 'https://www.famousbirthdays.com/faces/bartolome-donnalyn-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80',
  },
  // ── Designers ──
  {
    id: 'd1',
    name: 'Rajo Laurel',
    type: 'Designer',
    category: 'designer',
    isCelebrity: false,
    followers: '320K',
    rating: 5.0,
    products: 34,
    avatarUri: 'https://www.famousbirthdays.com/faces/laurel-rajo-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    id: 'd2',
    name: 'Josie Natori',
    type: 'Designer',
    category: 'designer',
    isCelebrity: false,
    followers: '210K',
    rating: 4.9,
    products: 27,
    avatarUri: 'https://www.famousbirthdays.com/faces/natori-josie-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
  },
  {
    id: 'd3',
    name: 'Monique Lhuillier',
    type: 'Designer',
    category: 'designer',
    isCelebrity: false,
    followers: '580K',
    rating: 5.0,
    products: 19,
    avatarUri: 'https://www.famousbirthdays.com/faces/lhuillier-monique-image.jpg',
    coverUri: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  },
  {
    id: 'd4',
    name: 'Patis Tesoro',
    type: 'Designer',
    category: 'designer',
    isCelebrity: false,
    followers: '145K',
    rating: 4.8,
    products: 41,
    avatarUri: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80',
    coverUri: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80',
  },
  {
    id: 'd5',
    name: 'Avel Bacudio',
    type: 'Designer',
    category: 'designer',
    isCelebrity: false,
    followers: '98K',
    rating: 4.7,
    products: 15,
    avatarUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    coverUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
  },
  // ── Sustainable Brands ──
  {
    id: 's1',
    name: 'Verde Collective',
    type: 'Sustainable Brand',
    category: 'sustainable',
    isCelebrity: false,
    followers: '88K',
    rating: 4.9,
    products: 52,
    avatarUri: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=200&q=80',
    coverUri: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&q=80',
  },
  {
    id: 's2',
    name: 'Hiraya PH',
    type: 'Sustainable Brand',
    category: 'sustainable',
    isCelebrity: false,
    followers: '124K',
    rating: 4.8,
    products: 38,
    avatarUri: 'https://images.unsplash.com/photo-1556760544-74068565f05c?w=200&q=80',
    coverUri: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80',
  },
  {
    id: 's3',
    name: 'Anthill Fabric Gallery',
    type: 'Sustainable Brand',
    category: 'sustainable',
    isCelebrity: false,
    followers: '67K',
    rating: 4.9,
    products: 29,
    avatarUri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80',
    coverUri: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',
  },
  {
    id: 's4',
    name: 'Niyog Studio',
    type: 'Sustainable Brand',
    category: 'sustainable',
    isCelebrity: false,
    followers: '43K',
    rating: 4.7,
    products: 17,
    avatarUri: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&q=80',
    coverUri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
  },
  {
    id: 's5',
    name: 'LIKHÂ',
    type: 'Sustainable Brand',
    category: 'sustainable',
    isCelebrity: false,
    followers: '56K',
    rating: 4.8,
    products: 23,
    avatarUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80',
    coverUri: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
  },
];

type FilterType = 'all' | 'celebrity' | 'designer' | 'sustainable';

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'celebrity', label: 'Celebrities' },
  { key: 'designer', label: 'Designers' },
  { key: 'sustainable', label: 'Sustainable' },
];

const CATEGORY_BADGES: Record<string, { color: string; bg: string }> = {
  celebrity: { color: '#4289AB', bg: '#EBF5FB' },
  designer:  { color: '#8B6914', bg: '#FEF9E7' },
  sustainable: { color: '#276749', bg: '#E9F7EF' },
};

export default function SellersScreen() {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredSellers = SELLERS.filter((seller) => {
    const matchesCategory = activeFilter === 'all' || seller.category === activeFilter;
    const matchesSearch = seller.name.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const headerTitle =
    activeFilter === 'celebrity' ? 'Celebrities & Influencers'
    : activeFilter === 'designer' ? 'Designers'
    : activeFilter === 'sustainable' ? 'Sustainable Brands'
    : 'All Sellers';

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeHeader} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <View style={styles.searchBar}>
            <Search size={16} color="#999" />
            <TextInput
              placeholder="Search sellers"
              placeholderTextColor="#BCBCBC"
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
            />
          </View>
        </View>
      </SafeAreaView>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 0 }}>
          {FILTER_TABS.map((filter) => (
            <Pressable
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[styles.filterTab, activeFilter === filter.key && styles.filterTabActive]}>
              <Text style={[styles.filterTabText, activeFilter === filter.key && styles.filterTabTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Category description strip */}
      {activeFilter !== 'all' && (
        <View style={styles.categoryStrip}>
          {activeFilter === 'designer' && (
            <View style={styles.stripInner}>
              <Gem size={13} color="#8B6914" />
              <Text style={[styles.stripText, { color: '#8B6914' }]}>
                Authenticated luxury from Philippine and international designers
              </Text>
            </View>
          )}
          {activeFilter === 'sustainable' && (
            <View style={styles.stripInner}>
              <Leaf size={13} color="#276749" />
              <Text style={[styles.stripText, { color: '#276749' }]}>
                Eco-conscious brands crafting pre-loved and ethically sourced pieces
              </Text>
            </View>
          )}
          {activeFilter === 'celebrity' && (
            <View style={styles.stripInner}>
              <Star size={13} color="#4289AB" />
              <Text style={[styles.stripText, { color: '#4289AB' }]}>
                Authenticated pre-loved items from celebrities and influencers
              </Text>
            </View>
          )}
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}>
        {filteredSellers.map((seller) => {
          const badge = CATEGORY_BADGES[seller.category] ?? CATEGORY_BADGES.celebrity;
          return (
            <Pressable
              key={seller.id}
              onPress={() => router.push(`/(tabs)/(seller)/${seller.id}`)}
              style={styles.card}>
              <View style={styles.coverWrap}>
                <Image source={{ uri: seller.coverUri }} style={styles.coverImage} resizeMode="cover" />
              </View>

              <View style={styles.avatarWrap}>
                <Image source={{ uri: seller.avatarUri }} style={styles.avatar} />
              </View>

              <View style={styles.cardBody}>
                <View style={styles.nameRow}>
                  <View style={styles.nameBlock}>
                    <View style={styles.nameInner}>
                      <Text style={styles.sellerName}>{seller.name}</Text>
                      {seller.isCelebrity && <BadgeCheck size={16} color="#fff" fill="#4289AB" />}
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.typeBadgeText, { color: badge.color }]}>{seller.type}</Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#CCC" style={{ marginTop: 2 }} />
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{seller.followers}</Text>
                    <Text style={styles.statLabel}>{seller.category === 'celebrity' ? 'Followers' : 'Shoppers'}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <View style={styles.ratingInner}>
                      <Star size={11} color="#FFB300" fill="#FFB300" />
                      <Text style={styles.statValue}>{seller.rating}</Text>
                    </View>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{seller.products}</Text>
                    <Text style={styles.statLabel}>Items</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  safeHeader: {
    backgroundColor: '#4289AB',
  },
  header: {
    backgroundColor: '#4289AB',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 12,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: '#fff',
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#333',
  },
  filterRow: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterTab: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: '#4289AB',
  },
  filterTabText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#999',
  },
  filterTabTextActive: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#4289AB',
  },
  categoryStrip: {
    backgroundColor: '#F0F6FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E4ECF1',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  stripInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  stripText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
    gap: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  coverWrap: {
    width: '100%',
    height: 100,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  avatarWrap: {
    position: 'absolute',
    top: 62,
    left: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#E8F0F5',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  cardBody: {
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  nameBlock: {
    flex: 1,
    gap: 4,
  },
  nameInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sellerName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#1A1A2E',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#222',
  },
  statLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#999',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E8EF',
  },
  ratingInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
});
