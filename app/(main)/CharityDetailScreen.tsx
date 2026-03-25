import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Globe,
  Heart,
  Users,
  Calendar,
  Target,
  Zap,
  ArrowRight,
  BadgeCheck,
  Clock,
  Droplet,
  Building2,
  LifeBuoy,
  Shield,
  BookOpen,
  Waves,
  Leaf,
  Home,
  GraduationCap,
  Phone,
  Gavel,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width: W } = Dimensions.get('window');

type ImpactIcon =
  | 'droplet' | 'building2' | 'lifeBuoy' | 'shield' | 'bookOpen'
  | 'waves' | 'leaf' | 'home' | 'graduationCap' | 'phone' | 'users' | 'heart';

type Charity = {
  id: string;
  name: string;
  tagline: string;
  logoUri: string;
  heroUri: string;
  founded: string;
  focus: string;
  focusColor: string;
  website: string;
  description: string;
  mission: string;
  stat: string;
  statLabel: string;
  impact: { icon: ImpactIcon; value: string; label: string }[];
  programs: { title: string; description: string }[];
  accentColors: [string, string];
};

const ICON_MAP: Record<ImpactIcon, React.ComponentType<{ size?: number; color?: string }>> = {
  droplet: Droplet,
  building2: Building2,
  lifeBuoy: LifeBuoy,
  shield: Shield,
  bookOpen: BookOpen,
  waves: Waves,
  leaf: Leaf,
  home: Home,
  graduationCap: GraduationCap,
  phone: Phone,
  users: Users,
  heart: Heart,
};

export const CHARITIES: Charity[] = [
  {
    id: 'redcross',
    name: 'Philippine Red Cross',
    tagline: 'Humanity in action since 1947',
    logoUri: 'https://redcross.org.ph/wp-content/themes/yootheme/cache/Logo-2x2-1-9a31ea36.png',
    heroUri: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&q=80',
    founded: '1947',
    focus: 'Disaster Relief & Blood Services',
    focusColor: '#DC2626',
    website: 'https://redcross.org.ph',
    description:
      "The Philippine Red Cross is the country's foremost humanitarian organization, delivering emergency relief, blood services, health programs, and disaster management across 90 chapters nationwide. It is one of 181 member societies of the International Federation of Red Cross and Red Crescent Societies.",
    mission:
      'To prevent and alleviate human suffering, protect life and health, and ensure respect for all human beings — guided by the seven fundamental principles of the Red Cross.',
    stat: '50%',
    statLabel: "of the country's blood supply",
    impact: [
      { icon: 'droplet', value: '74', label: 'Blood Facilities Nationwide' },
      { icon: 'building2', value: '90', label: 'Active Chapters' },
      { icon: 'lifeBuoy', value: '3', label: 'Lives Saved per Donation' },
    ],
    programs: [
      { title: 'National Blood Services', description: "Operates 74 blood service facilities supplying nearly 50% of the country's blood." },
      { title: 'Disaster Management', description: 'First responders in every major Philippine calamity, from typhoons to earthquakes.' },
      { title: 'Red Cross Youth', description: 'Trains the next generation of humanitarian volunteers in schools nationwide.' },
    ],
    accentColors: ['#DC2626', '#991B1B'],
  },
  {
    id: 'unicef',
    name: 'UNICEF Philippines',
    tagline: 'Every child, every right, every time',
    logoUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Logo_of_UNICEF.svg/512px-Logo_of_UNICEF.svg.png',
    heroUri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
    founded: '1948',
    focus: "Children's Rights & Education",
    focusColor: '#0077BF',
    website: 'https://www.unicef.org/philippines',
    description:
      'UNICEF Philippines has been present since 1948, making it one of the first UNICEF country offices in Asia. It works to uphold the rights of every Filipino child through healthcare, nutrition, education, and protection from abuse.',
    mission:
      'To work with governments, civil society, and communities to ensure that every Filipino child survives, thrives, and has an equal chance to reach their full potential.',
    stat: '30M+',
    statLabel: 'Filipino children reached annually',
    impact: [
      { icon: 'users', value: '30M+', label: 'Children Reached' },
      { icon: 'shield', value: '95%', label: 'Immunization Coverage' },
      { icon: 'bookOpen', value: '10K+', label: 'Schools Supported' },
    ],
    programs: [
      { title: 'Child Health & Nutrition', description: 'Immunization drives and nutrition programs reaching millions of Filipino children annually.' },
      { title: 'Quality Education', description: 'Supports schools in conflict and disaster-affected areas with learning materials and infrastructure.' },
      { title: 'Child Protection', description: 'Combats abuse, exploitation, and trafficking through policy advocacy and direct services.' },
    ],
    accentColors: ['#0077BF', '#005F9E'],
  },
  {
    id: 'wwf',
    name: 'WWF Philippines',
    tagline: 'Protecting nature for people and planet',
    logoUri: 'https://1000logos.net/wp-content/uploads/2021/04/WWF-logo.png',
    heroUri: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&q=80',
    founded: '1997',
    focus: 'Environmental Conservation',
    focusColor: '#15803D',
    website: 'https://wwf.org.ph',
    description:
      "WWF-Philippines (Kabang Kalikasan ng Pilipinas Foundation) is part of the global WWF network, protecting the Philippines' extraordinary biodiversity — from marine ecosystems to ancient forests and endangered species.",
    mission:
      "To conserve the richness of life on Earth and ensure a future where people live in harmony with nature, specifically preserving the Philippines' extraordinary natural heritage.",
    stat: '7,100+',
    statLabel: 'Species under active protection',
    impact: [
      { icon: 'leaf', value: '7,100+', label: 'Species Protected' },
      { icon: 'waves', value: '2.2M ha', label: 'Ocean Area Conserved' },
      { icon: 'home', value: '100', label: 'Food Sheds Built' },
    ],
    programs: [
      { title: 'Ocean Conservation', description: 'Protecting coral reefs, whale sharks, and sustainable fisheries across the Philippine archipelago.' },
      { title: 'Climate Advocacy', description: 'Lobbying for clean energy policy and helping communities adapt to the climate crisis.' },
      { title: 'Sustainable Agriculture', description: 'Promoting organic and regenerative farming practices to protect biodiversity.' },
    ],
    accentColors: ['#15803D', '#166534'],
  },
  {
    id: 'caritas',
    name: 'Caritas Philippines',
    tagline: 'Love in action for all Filipinos',
    logoUri: 'https://caritas.org.ph/wp-content/uploads/2024/01/caritas-philippines-new-logo-web-thumbnail.png',
    heroUri: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
    founded: '1966',
    focus: 'Poverty Alleviation & Community Development',
    focusColor: '#D97706',
    website: 'https://caritas.org.ph',
    description:
      "Caritas Philippines is the official social action arm of the Catholic Bishops' Conference of the Philippines, coordinating 85 Diocesan Social Action Centers. Its Alay Kapwa campaign (since 1975) is one of the country's longest-running charity drives.",
    mission:
      'To serve the poor and marginalized through integral human development — promoting justice, peace, and the integrity of creation rooted in Christian social teaching.',
    stat: '3.2M+',
    statLabel: 'Individuals reached after Typhoon Haiyan',
    impact: [
      { icon: 'home', value: '1,488', label: 'Shelter Units Built' },
      { icon: 'building2', value: '85', label: 'Diocesan Action Centers' },
      { icon: 'users', value: '659K', label: 'Households Assisted' },
    ],
    programs: [
      { title: 'Alay Kapwa', description: 'Annual Lenten fundraiser since 1975 that channels donations to the poorest communities.' },
      { title: 'Disaster Response', description: 'Coordinated relief for major typhoons — including 1,488 permanent shelters post-Haiyan.' },
      { title: 'Livelihood Programs', description: 'Microfinance, cooperative training, and sustainable livelihood support for marginalized families.' },
    ],
    accentColors: ['#D97706', '#B45309'],
  },
  {
    id: 'kapuso',
    name: 'GMA Kapuso Foundation',
    tagline: 'Reaching out to serve those in need',
    logoUri: 'https://www.pngitem.com/pimgs/m/211-2117847_gma-kapuso-foundation-hd-png-download.png',
    heroUri: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80',
    founded: '1991',
    focus: 'Disaster Relief & Housing',
    focusColor: '#7C3AED',
    website: 'https://www.gmanetwork.com/kapusofoundation/',
    description:
      'GMA Kapuso Foundation is the socio-civic arm of GMA Network, delivering relief, housing, livelihood, education, and medical assistance to impoverished Filipinos nationwide through media-powered advocacy and community outreach.',
    mission:
      'To reach out and uplift the lives of Filipinos in need through media-driven advocacy, disaster response, and sustainable community development programs.',
    stat: '403',
    statLabel: 'Permanent homes built for Haiyan survivors',
    impact: [
      { icon: 'home', value: '403', label: 'Homes Built (Haiyan)' },
      { icon: 'graduationCap', value: '5K+', label: 'Scholars Supported' },
      { icon: 'users', value: '100K+', label: 'Patients Given Aid' },
    ],
    programs: [
      { title: 'Operation Bayanihan', description: 'Flagship disaster relief program providing immediate aid in calamities nationwide.' },
      { title: 'Kapuso Village', description: 'Built permanent housing communities for typhoon survivors in Tacloban and Iligan.' },
      { title: 'Scholarship Program', description: 'Academic scholarships and livelihood training for deserving Filipinos.' },
    ],
    accentColors: ['#7C3AED', '#6D28D9'],
  },
  {
    id: 'abscbn',
    name: 'ABS-CBN Lingkod Kapamilya',
    tagline: 'Serving the Filipino family since 1989',
    logoUri: 'https://www.seekpng.com/png/detail/435-4357597_abs-cbn-foundation-updated-a-giveback-abs-cbn.png',
    heroUri: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&q=80',
    founded: '1989',
    focus: "Children's Rights & Education",
    focusColor: '#EA580C',
    website: 'https://www.abs-cbnfoundation.org',
    description:
      "ABS-CBN Lingkod Kapamilya Foundation has been operational since 1989, running media-powered programs covering children's rights, education, environment, disaster resilience, and sustainable livelihood across the Philippines.",
    mission:
      'To empower Filipinos through service, enabling every Kapamilya to live with dignity and realize their full potential through media-driven advocacy and community programs.',
    stat: '10M+',
    statLabel: 'Trees planted through Bantay Kalikasan',
    impact: [
      { icon: 'phone', value: '24/7', label: 'Bantay Bata Hotline' },
      { icon: 'leaf', value: '10M+', label: 'Trees Planted' },
      { icon: 'bookOpen', value: '50K+', label: 'Children in Programs' },
    ],
    programs: [
      { title: 'Bantay Bata 163', description: "Philippines' first 24/7 child welfare hotline offering rescue, legal, and medical assistance." },
      { title: 'Sagip Kapamilya', description: 'Rapid disaster response program deployed in every major calamity since 1989.' },
      { title: 'Bantay Kalikasan', description: 'Environmental program that has planted over 10 million trees in critical watershed areas.' },
    ],
    accentColors: ['#EA580C', '#C2410C'],
  },
];

// Auction mock data per charity
const CHARITY_AUCTIONS: Record<string, { title: string; price: string; timeLeft: string; imageUri: string; bids: number; seller: string }[]> = {
  redcross: [
    { title: 'ASAP Stage Gown', price: '₱9,500', timeLeft: '4h 20m', imageUri: 'https://images.unsplash.com/photo-1484327973588-c31f829103fe?w=600&q=80', bids: 14, seller: 'Anne Curtis' },
    { title: 'Signed Guitar', price: '₱15,000', timeLeft: '2h 10m', imageUri: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80', bids: 9, seller: 'Bamboo Mañalac' },
  ],
  unicef: [
    { title: 'Film Premiere Gown', price: '₱18,500', timeLeft: '1h 45m', imageUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', bids: 22, seller: 'Heart Evangelista' },
  ],
  wwf: [
    { title: 'Signed MAC Palette', price: '₱7,800', timeLeft: '12h 30m', imageUri: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80', bids: 6, seller: 'Kylie Padilla' },
  ],
  caritas: [],
  kapuso: [],
  abscbn: [],
};

function CharityLogo({ logoUri, name, color }: { logoUri: string; name: string; color: string }) {
  const [failed, setFailed] = useState(false);
  const initial = name.charAt(0).toUpperCase();
  if (failed) {
    return (
      <LinearGradient colors={[color, color + 'BB']} style={s.logoGrad}>
        <Text style={s.logoInitial}>{initial}</Text>
      </LinearGradient>
    );
  }
  return (
    <View style={s.logoWrap}>
      <Image
        source={{ uri: logoUri }}
        style={s.logoImg}
        resizeMode="contain"
        onError={() => setFailed(true)}
      />
    </View>
  );
}

export default function CharityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const charity = CHARITIES.find((c) => c.id === id) ?? CHARITIES[0];
  const auctions = CHARITY_AUCTIONS[charity.id] ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero image */}
        <View style={s.heroContainer}>
          <Image
            source={{ uri: charity.heroUri }}
            style={s.heroImg}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.1)', 'transparent']}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Back button */}
          <SafeAreaView style={s.heroNav} edges={['top']}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}>
              <ChevronLeft size={20} color="#fff" />
            </Pressable>
          </SafeAreaView>
        </View>

        {/* Logo + Name card (with focus badge inside) */}
        <Animated.View entering={FadeInDown.delay(80).duration(450)} style={s.identityCard}>
          <CharityLogo logoUri={charity.logoUri} name={charity.name} color={charity.focusColor} />
          <View style={{ flex: 1 }}>
            {/* Focus badge */}
            <View style={[s.focusBadge, { backgroundColor: charity.focusColor + '18' }]}>
              <Text style={[s.focusBadgeText, { color: charity.focusColor }]}>{charity.focus}</Text>
            </View>
            <Text style={s.charityName}>{charity.name}</Text>
            <Text style={s.charityTagline}>{charity.tagline}</Text>
            <View style={s.metaRow}>
              <View style={s.metaItem}>
                <Calendar size={11} color="#4289AB" />
                <Text style={s.metaText}>Est. {charity.founded}</Text>
              </View>
              <View style={s.metaItem}>
                <BadgeCheck size={11} color="#10B981" />
                <Text style={[s.metaText, { color: '#10B981' }]}>Verified Partner</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Big impact stat */}
        <Animated.View entering={FadeInDown.delay(130).duration(450)}>
          <LinearGradient
            colors={charity.accentColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.statBanner}>
            <Zap size={22} color="rgba(255,255,255,0.8)" />
            <View>
              <Text style={s.statValue}>{charity.stat}</Text>
              <Text style={s.statDesc}>{charity.statLabel}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(180).duration(450)} style={s.section}>
          <Text style={s.sectionTitle}>About</Text>
          <Text style={s.bodyText}>{charity.description}</Text>
        </Animated.View>

        {/* Mission */}
        <Animated.View entering={FadeInDown.delay(220).duration(450)} style={s.missionCard}>
          <Target size={18} color="#4289AB" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.missionLabel}>Our Mission</Text>
            <Text style={s.missionText}>{charity.mission}</Text>
          </View>
        </Animated.View>

        {/* Impact Numbers */}
        <Animated.View entering={FadeInDown.delay(260).duration(450)} style={s.section}>
          <Text style={s.sectionTitle}>Our Impact</Text>
          <View style={s.impactRow}>
            {charity.impact.map((item, i) => {
              const IconComp = ICON_MAP[item.icon];
              return (
                <View key={i} style={s.impactItem}>
                  <View style={[s.impactIconWrap, { backgroundColor: charity.focusColor + '18' }]}>
                    <IconComp size={20} color={charity.focusColor} />
                  </View>
                  <Text style={s.impactValue}>{item.value}</Text>
                  <Text style={s.impactLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Programs */}
        <Animated.View entering={FadeInDown.delay(300).duration(450)} style={s.section}>
          <Text style={s.sectionTitle}>Key Programs</Text>
          <View style={{ gap: 10 }}>
            {charity.programs.map((prog, i) => (
              <View key={i} style={s.programCard}>
                <View style={[s.programDot, { backgroundColor: charity.focusColor }]} />
                <View style={{ flex: 1 }}>
                  <Text style={s.programTitle}>{prog.title}</Text>
                  <Text style={s.programDesc}>{prog.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Live Auctions */}
        {auctions.length > 0 && (
          <Animated.View entering={FadeInDown.delay(340).duration(450)} style={s.section}>
            <Text style={s.sectionTitle}>Live Auctions Benefiting This Cause</Text>
            <View style={{ gap: 14 }}>
              {auctions.map((auction, i) => (
                <Pressable
                  key={i}
                  onPress={() => router.push({
                    pathname: '/(main)/BiddingScreen',
                    params: { cause: charity.name, charityId: charity.id },
                  } as any)}
                  style={({ pressed }) => [s.auctionCard, pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] }]}>
                  {/* Image */}
                  <View style={s.auctionImgWrap}>
                    <Image source={{ uri: auction.imageUri }} style={s.auctionImg} resizeMode="cover" />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.5)']}
                      style={StyleSheet.absoluteFillObject}
                    />
                    {/* Live badge */}
                    <View style={s.liveBadge}>
                      <View style={s.liveDot} />
                      <Text style={s.liveText}>LIVE</Text>
                    </View>
                    {/* Time left */}
                    <View style={s.timeChip}>
                      <Clock size={11} color="#fff" />
                      <Text style={s.timeChipText}>{auction.timeLeft} left</Text>
                    </View>
                  </View>
                  {/* Info */}
                  <View style={s.auctionInfo}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.auctionTitle} numberOfLines={1}>{auction.title}</Text>
                      <Text style={s.auctionSeller} numberOfLines={1}>{auction.seller}</Text>
                      <View style={s.auctionBidsRow}>
                        <Gavel size={11} color="#9CA3AF" />
                        <Text style={s.auctionBidsText}>{auction.bids} bids</Text>
                      </View>
                    </View>
                    <View>
                      <Text style={s.auctionPriceLabel}>Current Bid</Text>
                      <Text style={[s.auctionPrice, { color: charity.focusColor }]}>{auction.price}</Text>
                    </View>
                  </View>
                  {/* Bid button */}
                  <LinearGradient
                    colors={charity.accentColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={s.bidNowBtn}>
                    <Gavel size={14} color="#fff" />
                    <Text style={s.bidNowText}>Place a Bid</Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Visit Website */}
        <Animated.View entering={FadeInDown.delay(380).duration(450)} style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Pressable
            onPress={() => Linking.openURL(charity.website)}
            style={({ pressed }) => [s.websiteBtn, pressed && { opacity: 0.8 }]}>
            <Globe size={17} color="#fff" />
            <Text style={s.websiteBtnText}>Visit Official Website</Text>
            <ArrowRight size={15} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </Animated.View>

        {/* Donate CTA */}
        <Animated.View entering={FadeInDown.delay(420).duration(450)} style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <View style={s.donateCta}>
            <Heart size={18} color="#E91E63" fill="#E91E63" />
            <Text style={s.donateCtaText}>
              Bid on any charity auction to directly support {charity.name}. Every peso makes a difference.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  heroContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backBtn: {
    margin: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -28,
    borderRadius: 18,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 10,
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  logoImg: {
    width: 52,
    height: 52,
  },
  logoGrad: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#fff',
  },
  focusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 5,
  },
  focusBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
  },
  charityName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#1A1A2E',
    marginBottom: 1,
    lineHeight: 20,
  },
  charityTagline: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: '#4289AB',
  },
  statBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: '#fff',
    lineHeight: 30,
  },
  statDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 22,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#1A1A2E',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  bodyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 21,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EBF5FB',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4289AB',
  },
  missionLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#4289AB',
    marginBottom: 4,
  },
  missionText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#374151',
    lineHeight: 19,
  },
  impactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  impactItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  impactIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  impactValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#1A1A2E',
    textAlign: 'center',
  },
  impactLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 13,
  },
  programCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  programDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  programTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#1A1A2E',
    marginBottom: 2,
  },
  programDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 17,
  },
  // Auction cards — full width, proper layout
  auctionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  auctionImgWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  auctionImg: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E91E63',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
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
    letterSpacing: 0.5,
  },
  timeChip: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  timeChipText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: '#fff',
  },
  auctionInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 10,
  },
  auctionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: '#1A1A2E',
    marginBottom: 2,
  },
  auctionSeller: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  auctionBidsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  auctionBidsText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#9CA3AF',
  },
  auctionPriceLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  auctionPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    textAlign: 'right',
  },
  bidNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 14,
    marginBottom: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bidNowText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#fff',
  },
  websiteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4289AB',
    borderRadius: 14,
    paddingVertical: 14,
  },
  websiteBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#fff',
    flex: 1,
  },
  donateCta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFF0F5',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  donateCtaText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#9D174D',
    lineHeight: 18,
    flex: 1,
  },
});
