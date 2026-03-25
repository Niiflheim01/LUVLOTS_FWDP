import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  TextInput,
  Switch,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Camera,
  X,
  Plus,
  Heart,
  ChevronDown,
  ChevronUp,
  Check,
  Info,
  DollarSign,
  Percent,
  HandHeart,
  Building2,
  Globe,
  BadgeCheck,
  ImageIcon,
  Tag,
  Package,
  FileText,
  Layers,
  Gavel,
  Eye,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn, SlideInRight, Layout } from 'react-native-reanimated';
import Modal from 'react-native-modal';

const { width: SCREEN_W } = Dimensions.get('window');

/* ── Dummy charity organisations ─────────────────────────── */
type CharityOrg = {
  id: string;
  name: string;
  logo: string;
  category: string;
  description: string;
  verified: boolean;
  totalRaised: number;
  supporters: number;
};

const CHARITIES: CharityOrg[] = [
  {
    id: 'c1',
    name: 'Philippine Red Cross',
    logo: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=120&q=80',
    category: 'Disaster Relief',
    description: 'Providing humanitarian assistance and disaster relief across the Philippines.',
    verified: true,
    totalRaised: 12500000,
    supporters: 45200,
  },
  {
    id: 'c2',
    name: 'Greenpeace Philippines',
    logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=120&q=80',
    category: 'Environment',
    description: 'Campaigning to protect the planet, defend forests, and fight climate change.',
    verified: true,
    totalRaised: 8900000,
    supporters: 32100,
  },
  {
    id: 'c3',
    name: 'UNICEF Philippines',
    logo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=120&q=80',
    category: 'Children & Education',
    description: 'Working for every child\'s right to education, health, and protection.',
    verified: true,
    totalRaised: 21400000,
    supporters: 78600,
  },
  {
    id: 'c4',
    name: 'WWF Philippines',
    logo: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=120&q=80',
    category: 'Wildlife & Nature',
    description: 'Conserving nature and reducing the most pressing threats to the diversity of life on Earth.',
    verified: true,
    totalRaised: 6700000,
    supporters: 21400,
  },
  {
    id: 'c5',
    name: 'Gawad Kalinga',
    logo: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=120&q=80',
    category: 'Community Development',
    description: 'Building communities and ending poverty for Filipino families through social enterprise.',
    verified: true,
    totalRaised: 15200000,
    supporters: 53800,
  },
  {
    id: 'c6',
    name: 'ABS-CBN Lingkod Kapamilya',
    logo: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=120&q=80',
    category: 'Humanitarian',
    description: 'Reaching out to communities through education, livelihood, and relief operations.',
    verified: false,
    totalRaised: 4300000,
    supporters: 18900,
  },
  {
    id: 'c7',
    name: 'Habitat for Humanity PH',
    logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=120&q=80',
    category: 'Housing',
    description: 'Building strength, stability, and self-reliance through shelter for Filipino families.',
    verified: true,
    totalRaised: 9800000,
    supporters: 29700,
  },
  {
    id: 'c8',
    name: 'Save the Children PH',
    logo: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=120&q=80',
    category: 'Children & Education',
    description: 'Ensuring every child has a healthy start in life and the opportunity to learn.',
    verified: true,
    totalRaised: 11300000,
    supporters: 41500,
  },
];

const PERCENTAGE_OPTIONS = [5, 10, 15, 20, 25, 30, 50];

/* ── Dummy product images ─────────────────────────── */
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&q=80',
  'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=200&q=80',
];

/* ── Category options ─────────────────────────── */
const CATEGORIES = [
  'Clothing & Apparel',
  'Accessories & Jewelry',
  'Collectibles & Memorabilia',
  'Vintage & Antique',
  'Art & Craft',
  'Electronics & Gadgets',
  'Home & Living',
  'Books & Media',
  'Sports & Outdoor',
  'Other',
];

/* ── Main screen ─────────────────────────────────── */
export default function AddProduct() {
  // Basic product fields
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([PLACEHOLDER_IMAGES[0]]);
  const [isAuction, setIsAuction] = useState(false);
  const [startingBid, setStartingBid] = useState('');

  // Charity sharing
  const [charityEnabled, setCharityEnabled] = useState(false);
  const [charityPercent, setCharityPercent] = useState(10);
  const [selectedCharity, setSelectedCharity] = useState<CharityOrg | null>(null);
  const [showCharityPicker, setShowCharityPicker] = useState(false);
  const [charitySearch, setCharitySearch] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [expandedCharityInfo, setExpandedCharityInfo] = useState(false);

  const charityFiltered = CHARITIES.filter((c) =>
    c.name.toLowerCase().includes(charitySearch.toLowerCase()) ||
    c.category.toLowerCase().includes(charitySearch.toLowerCase())
  );

  const computedCharityAmount = price ? (parseFloat(price) * charityPercent / 100).toFixed(2) : '0.00';
  const computedSellerAmount = price ? (parseFloat(price) * (100 - charityPercent) / 100).toFixed(2) : '0.00';

  /* ── Sections ─────────────────────────────────── */
  function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
    return (
      <View style={s.sectionHeader}>
        <View style={s.sectionIconWrap}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text style={s.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={s.sectionSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      {/* ── Header ──────────────── */}
      <LinearGradient colors={['#1A365D', '#2C5F8A']} style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.headerRow}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <ChevronLeft size={22} color="#fff" />
            </Pressable>
            <Text style={s.headerTitle}>Add Product</Text>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Images Section ──────── */}
        <Animated.View entering={FadeInDown.delay(60).duration(400)} style={s.card}>
          <SectionHeader icon={<ImageIcon size={16} color="#4289AB" />} title="Product Images" subtitle="Add up to 9 images. First image will be the cover." />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 12 }}>
            {images.map((img, i) => (
              <View key={i} style={s.imageThumb}>
                <Image source={{ uri: img }} style={s.thumbImg} />
                {i === 0 && (
                  <View style={s.coverBadge}>
                    <Text style={s.coverBadgeText}>Cover</Text>
                  </View>
                )}
                <Pressable style={s.removeImgBtn} onPress={() => setImages(images.filter((_, j) => j !== i))}>
                  <X size={10} color="#fff" />
                </Pressable>
              </View>
            ))}
            <Pressable style={s.addImageBtn} onPress={() => setImages([...images, PLACEHOLDER_IMAGES[images.length % PLACEHOLDER_IMAGES.length]])}>
              <Camera size={22} color="#9CA3AF" />
              <Text style={s.addImageText}>{images.length}/9</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>

        {/* ── Basic Info ──────────── */}
        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={s.card}>
          <SectionHeader icon={<FileText size={16} color="#4289AB" />} title="Basic Information" />

          <Text style={s.label}>Product Name *</Text>
          <TextInput style={s.input} placeholder="e.g. Signed Tour Jacket 2023" placeholderTextColor="#C4C4C4" value={productName} onChangeText={setProductName} />

          <Text style={s.label}>Description</Text>
          <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Describe your product..." placeholderTextColor="#C4C4C4" value={description} onChangeText={setDescription} multiline />

          <Text style={s.label}>Category *</Text>
          <Pressable style={s.dropdownBtn} onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
            <Text style={category ? s.dropdownValue : s.dropdownPlaceholder}>{category || 'Select category'}</Text>
            {showCategoryPicker ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
          </Pressable>
          {showCategoryPicker && (
            <Animated.View entering={FadeIn.duration(200)} style={s.dropdownList}>
              {CATEGORIES.map((cat) => (
                <Pressable key={cat} style={[s.dropdownItem, category === cat && s.dropdownItemActive]} onPress={() => { setCategory(cat); setShowCategoryPicker(false); }}>
                  <Text style={[s.dropdownItemText, category === cat && s.dropdownItemTextActive]}>{cat}</Text>
                  {category === cat && <Check size={14} color="#4289AB" />}
                </Pressable>
              ))}
            </Animated.View>
          )}
        </Animated.View>

        {/* ── Pricing & Stock ──────── */}
        <Animated.View entering={FadeInDown.delay(180).duration(400)} style={s.card}>
          <SectionHeader icon={<Tag size={16} color="#4289AB" />} title="Pricing & Stock" />

          <View style={s.rowFields}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Price (₱) *</Text>
              <View style={s.currencyInput}>
                <Text style={s.currencyPrefix}>₱</Text>
                <TextInput style={s.currencyField} placeholder="0.00" placeholderTextColor="#C4C4C4" keyboardType="numeric" value={price} onChangeText={setPrice} />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Compare Price</Text>
              <View style={s.currencyInput}>
                <Text style={s.currencyPrefix}>₱</Text>
                <TextInput style={s.currencyField} placeholder="0.00" placeholderTextColor="#C4C4C4" keyboardType="numeric" value={originalPrice} onChangeText={setOriginalPrice} />
              </View>
            </View>
          </View>

          <View style={s.rowFields}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Stock *</Text>
              <TextInput style={s.input} placeholder="0" placeholderTextColor="#C4C4C4" keyboardType="numeric" value={stock} onChangeText={setStock} />
            </View>
            <View style={{ flex: 1 }} />
          </View>
        </Animated.View>

        {/* ── Auction Option ──────── */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)} style={s.card}>
          <SectionHeader icon={<Gavel size={16} color="#D9AC4E" />} title="Auction Settings" subtitle="Enable if this product is for auction" />
          <View style={s.toggleRow}>
            <Text style={s.toggleLabel}>Enable Auction</Text>
            <Switch
              value={isAuction}
              onValueChange={setIsAuction}
              trackColor={{ false: '#E5E7EB', true: '#D9AC4E55' }}
              thumbColor={isAuction ? '#D9AC4E' : '#ccc'}
            />
          </View>
          {isAuction && (
            <Animated.View entering={FadeIn.duration(200)}>
              <Text style={s.label}>Starting Bid (₱)</Text>
              <View style={s.currencyInput}>
                <Text style={s.currencyPrefix}>₱</Text>
                <TextInput style={s.currencyField} placeholder="0.00" placeholderTextColor="#C4C4C4" keyboardType="numeric" value={startingBid} onChangeText={setStartingBid} />
              </View>
            </Animated.View>
          )}
        </Animated.View>

        {/* ═══════════════════════════════════════════════════
            ── ❤️  CHARITY REVENUE SHARING SECTION  ❤️ ──
            ═══════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={[s.card, charityEnabled && s.charityCardActive]}>
          {/* Header banner */}
          {charityEnabled && (
            <LinearGradient
              colors={['#E8F5E9', '#C8E6C9']}
              style={s.charityBanner}>
              <HandHeart size={16} color="#2E7D32" />
              <Text style={s.charityBannerText}>You're making a difference! 🌟</Text>
            </LinearGradient>
          )}

          <SectionHeader
            icon={<HandHeart size={16} color="#E53935" />}
            title="Share Revenue with Charity"
            subtitle="Donate a portion of every sale to a cause you care about"
          />

          {/* Toggle */}
          <View style={s.charityToggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.toggleLabel}>Enable Charity Sharing</Text>
              <Text style={s.toggleHint}>A percentage of each sale goes to your chosen charity</Text>
            </View>
            <Switch
              value={charityEnabled}
              onValueChange={(v) => {
                setCharityEnabled(v);
                if (!v) setSelectedCharity(null);
              }}
              trackColor={{ false: '#E5E7EB', true: '#E5393555' }}
              thumbColor={charityEnabled ? '#E53935' : '#ccc'}
            />
          </View>

          {charityEnabled && (
            <Animated.View entering={FadeIn.duration(300)}>

              {/* ── Percentage selector ── */}
              <View style={s.charitySection}>
                <View style={s.charitySectionLabel}>
                  <Percent size={14} color="#4289AB" />
                  <Text style={s.charitySectionTitle}>Revenue Share Percentage</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {PERCENTAGE_OPTIONS.map((pct) => (
                    <Pressable
                      key={pct}
                      onPress={() => setCharityPercent(pct)}
                      style={[s.pctPill, charityPercent === pct && s.pctPillActive]}>
                      <Text style={[s.pctPillText, charityPercent === pct && s.pctPillTextActive]}>{pct}%</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* ── Revenue Split Preview ── */}
              {price ? (
                <Animated.View entering={FadeIn.duration(200)} style={s.splitPreview}>
                  <Text style={s.splitTitle}>Revenue Split Preview</Text>
                  <View style={s.splitBar}>
                    <View style={[s.splitBarSeller, { flex: 100 - charityPercent }]} />
                    <View style={[s.splitBarCharity, { flex: charityPercent }]} />
                  </View>
                  <View style={s.splitRow}>
                    <View style={s.splitItem}>
                      <View style={[s.splitDot, { backgroundColor: '#4289AB' }]} />
                      <View>
                        <Text style={s.splitLabel}>You receive</Text>
                        <Text style={s.splitAmount}>₱{parseFloat(computedSellerAmount).toLocaleString()}</Text>
                      </View>
                      <Text style={s.splitPct}>{100 - charityPercent}%</Text>
                    </View>
                    <View style={s.splitItem}>
                      <View style={[s.splitDot, { backgroundColor: '#E53935' }]} />
                      <View>
                        <Text style={s.splitLabel}>Charity receives</Text>
                        <Text style={[s.splitAmount, { color: '#E53935' }]}>₱{parseFloat(computedCharityAmount).toLocaleString()}</Text>
                      </View>
                      <Text style={[s.splitPct, { color: '#E53935' }]}>{charityPercent}%</Text>
                    </View>
                  </View>
                </Animated.View>
              ) : null}

              {/* ── Charity Picker ── */}
              <View style={s.charitySection}>
                <View style={s.charitySectionLabel}>
                  <Building2 size={14} color="#4289AB" />
                  <Text style={s.charitySectionTitle}>Select Charity Organization</Text>
                </View>

                {selectedCharity ? (
                  <Animated.View entering={SlideInRight.duration(300)} style={s.selectedCharityCard}>
                    <Image source={{ uri: selectedCharity.logo }} style={s.selectedCharityLogo} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={s.selectedCharityName}>{selectedCharity.name}</Text>
                        {selectedCharity.verified && <BadgeCheck size={14} color="#4289AB" />}
                      </View>
                      <Text style={s.selectedCharityCategory}>{selectedCharity.category}</Text>
                      <Text style={s.selectedCharitySupporters}>
                        {selectedCharity.supporters.toLocaleString()} supporters
                      </Text>
                    </View>
                    <Pressable onPress={() => setSelectedCharity(null)} style={s.changeCharityBtn}>
                      <Text style={s.changeCharityText}>Change</Text>
                    </Pressable>
                  </Animated.View>
                ) : (
                  <Pressable onPress={() => setShowCharityPicker(true)} style={s.chooseCharityBtn}>
                    <HandHeart size={20} color="#E53935" />
                    <Text style={s.chooseCharityText}>Choose a Charity</Text>
                    <ChevronDown size={16} color="#9CA3AF" />
                  </Pressable>
                )}
              </View>

              {/* ── Info tip ── */}
              <Pressable style={s.infoTip} onPress={() => setExpandedCharityInfo(!expandedCharityInfo)}>
                <Info size={14} color="#4289AB" />
                <Text style={s.infoTipText}>How does charity sharing work?</Text>
                {expandedCharityInfo ? <ChevronUp size={14} color="#4289AB" /> : <ChevronDown size={14} color="#4289AB" />}
              </Pressable>
              {expandedCharityInfo && (
                <Animated.View entering={FadeIn.duration(200)} style={s.infoExpanded}>
                  <Text style={s.infoExpandedText}>
                    {`When charity sharing is enabled, the selected percentage of each sale is automatically set aside and donated to your chosen organization at the end of each month.\n\n• Your product listing will display a charity badge 🎗️\n• Buyers can see which charity benefits from their purchase\n• You'll receive a monthly donation receipt for tax purposes\n• You can change the charity or percentage at any time`}
                  </Text>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </Animated.View>

        {/* ── Product Preview ──────── */}
        {(productName || price) ? (
          <Animated.View entering={FadeInDown.delay(360).duration(400)} style={s.card}>
            <SectionHeader icon={<Eye size={16} color="#4289AB" />} title="Product Preview" />
            <View style={s.previewCard}>
              <Image source={{ uri: images[0] || PLACEHOLDER_IMAGES[0] }} style={s.previewImage} />
              <View style={s.previewInfo}>
                <Text style={s.previewName} numberOfLines={1}>{productName || 'Product Name'}</Text>
                <Text style={s.previewPrice}>₱{price ? parseFloat(price).toLocaleString() : '0'}</Text>
                {charityEnabled && selectedCharity && (
                  <View style={s.previewCharityBadge}>
                    <Heart size={10} color="#E53935" fill="#E53935" />
                    <Text style={s.previewCharityText}>{charityPercent}% to {selectedCharity.name}</Text>
                  </View>
                )}
                {isAuction && (
                  <View style={s.previewAuctionBadge}>
                    <Gavel size={10} color="#D9AC4E" />
                    <Text style={s.previewAuctionText}>Auction</Text>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>

      {/* ── Bottom CTA ──────── */}
      <View style={s.bottomBar}>
        <SafeAreaView edges={['bottom']}>
          <View style={s.bottomRow}>
            <Pressable onPress={() => router.back()} style={s.saveDraftBtn}>
              <Text style={s.saveDraftText}>Save Draft</Text>
            </Pressable>
            <Pressable style={s.publishBtn}>
              <LinearGradient colors={['#4289AB', '#2C5F8A']} style={s.publishGradient}>
                <Text style={s.publishText}>Publish Product</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      {/* ══════════════════════════════════════
          ── Charity Picker Modal ──
          ══════════════════════════════════════ */}
      <Modal
        isVisible={showCharityPicker}
        onBackdropPress={() => setShowCharityPicker(false)}
        onSwipeComplete={() => setShowCharityPicker(false)}
        swipeDirection="down"
        style={{ justifyContent: 'flex-end', margin: 0 }}
        backdropOpacity={0.5}
        propagateSwipe>
        <View style={s.modalContent}>
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>Select Charity</Text>
          <Text style={s.modalSubtitle}>Choose an organization to share revenue with</Text>

          {/* Search */}
          <View style={s.modalSearch}>
            <View style={s.modalSearchIcon}>
              <Globe size={16} color="#9CA3AF" />
            </View>
            <TextInput
              style={s.modalSearchInput}
              placeholder="Search charities..."
              placeholderTextColor="#C4C4C4"
              value={charitySearch}
              onChangeText={setCharitySearch}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {charityFiltered.map((charity, idx) => (
              <Animated.View key={charity.id} entering={FadeInDown.delay(idx * 40).duration(300)}>
                <Pressable
                  style={[s.charityRow, selectedCharity?.id === charity.id && s.charityRowActive]}
                  onPress={() => {
                    setSelectedCharity(charity);
                    setShowCharityPicker(false);
                    setCharitySearch('');
                  }}>
                  <Image source={{ uri: charity.logo }} style={s.charityLogo} />
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={s.charityName}>{charity.name}</Text>
                      {charity.verified && <BadgeCheck size={12} color="#4289AB" />}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <View style={s.charityCatBadge}>
                        <Text style={s.charityCatText}>{charity.category}</Text>
                      </View>
                    </View>
                    <Text style={s.charityDesc} numberOfLines={2}>{charity.description}</Text>
                    <View style={s.charityStats}>
                      <Text style={s.charityStat}>₱{(charity.totalRaised / 1000000).toFixed(1)}M raised</Text>
                      <View style={s.charityStatDot} />
                      <Text style={s.charityStat}>{(charity.supporters / 1000).toFixed(1)}K supporters</Text>
                    </View>
                  </View>
                  {selectedCharity?.id === charity.id && (
                    <View style={s.charityCheck}>
                      <Check size={16} color="#fff" />
                    </View>
                  )}
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ── Category Picker Modal (for mobile niceness) ── */}
    </View>
  );
}

/* ── Styles ───────────────────────────────────────────── */
const s = StyleSheet.create({
  /* Header */
  header: { paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' },

  /* Cards */
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  charityCardActive: { borderWidth: 1.5, borderColor: '#E5393540' },

  /* Section Header */
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  sectionIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#EFF6FA', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#1A365D' },
  sectionSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  /* Images */
  imageThumb: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  thumbImg: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#E5E7EB' },
  coverBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: '#4289AB', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  coverBadgeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 8, color: '#fff' },
  removeImgBtn: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  addImageBtn: { width: 80, height: 80, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addImageText: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#9CA3AF' },

  /* Form fields */
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#4B5563', marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#333' },
  rowFields: { flexDirection: 'row', gap: 12 },
  currencyInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, overflow: 'hidden' },
  currencyPrefix: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#9CA3AF', paddingHorizontal: 12, backgroundColor: '#F3F4F6' },
  currencyField: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#333', paddingHorizontal: 10, paddingVertical: 12 },

  /* Dropdown */
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  dropdownValue: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#333' },
  dropdownPlaceholder: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#C4C4C4' },
  dropdownList: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginTop: 6, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownItemActive: { backgroundColor: '#EFF6FA' },
  dropdownItemText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#333' },
  dropdownItemTextActive: { fontFamily: 'Poppins_600SemiBold', color: '#4289AB' },

  /* Toggle */
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  toggleLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#333' },
  toggleHint: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 2 },

  /* ── CHARITY styles ── */
  charityBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, marginBottom: 12 },
  charityBannerText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#2E7D32' },
  charityToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12 },
  charitySection: { marginTop: 18 },
  charitySectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  charitySectionTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#4B5563' },

  /* Percentage pills */
  pctPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  pctPillActive: { borderColor: '#E53935', backgroundColor: '#FEF2F2' },
  pctPillText: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#9CA3AF' },
  pctPillTextActive: { color: '#E53935' },

  /* Revenue Split Preview */
  splitPreview: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginTop: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  splitTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#4B5563', marginBottom: 10 },
  splitBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  splitBarSeller: { backgroundColor: '#4289AB', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
  splitBarCharity: { backgroundColor: '#E53935', borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  splitRow: { gap: 8 },
  splitItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  splitDot: { width: 10, height: 10, borderRadius: 5 },
  splitLabel: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF' },
  splitAmount: { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#1A365D' },
  splitPct: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#4289AB', marginLeft: 'auto' },

  /* Selected charity card */
  selectedCharityCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FEF2F2', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5393525' },
  selectedCharityLogo: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB' },
  selectedCharityName: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1A365D' },
  selectedCharityCategory: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#E53935' },
  selectedCharitySupporters: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  changeCharityBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  changeCharityText: { fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#4289AB' },

  /* Choose charity button */
  chooseCharityBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#E5393550', borderRadius: 14, backgroundColor: '#FEF2F210' },
  chooseCharityText: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#E53935' },

  /* Info tip */
  infoTip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 18, paddingVertical: 8 },
  infoTipText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#4289AB', flex: 1 },
  infoExpanded: { backgroundColor: '#EFF6FA', borderRadius: 12, padding: 14, marginTop: 6 },
  infoExpandedText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#4B5563', lineHeight: 20 },

  /* Preview */
  previewCard: { flexDirection: 'row', gap: 12, marginTop: 10, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  previewImage: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#E5E7EB' },
  previewInfo: { flex: 1, justifyContent: 'center' },
  previewName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1A365D' },
  previewPrice: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#4289AB', marginTop: 2 },
  previewCharityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, backgroundColor: '#FEF2F2', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  previewCharityText: { fontFamily: 'Poppins_600SemiBold', fontSize: 9, color: '#E53935' },
  previewAuctionBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, backgroundColor: '#FEF3C710', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#D9AC4E30' },
  previewAuctionText: { fontFamily: 'Poppins_600SemiBold', fontSize: 9, color: '#D9AC4E' },

  /* Bottom bar */
  bottomBar: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingHorizontal: 16, paddingTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 10 },
  bottomRow: { flexDirection: 'row', gap: 12, paddingBottom: 4 },
  saveDraftBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#4289AB' },
  saveDraftText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#4289AB' },
  publishBtn: { flex: 2, borderRadius: 14, overflow: 'hidden' },
  publishGradient: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14 },
  publishText: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#fff' },

  /* ── Modal styles ── */
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#1A365D' },
  modalSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  modalSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginTop: 16, marginBottom: 12, overflow: 'hidden' },
  modalSearchIcon: { paddingHorizontal: 12 },
  modalSearchInput: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#333', paddingVertical: 11, paddingRight: 12 },

  /* Charity row */
  charityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  charityRowActive: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#E5393525' },
  charityLogo: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB' },
  charityName: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#1A365D' },
  charityCatBadge: { backgroundColor: '#EFF6FA', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  charityCatText: { fontFamily: 'Poppins_600SemiBold', fontSize: 9, color: '#4289AB' },
  charityDesc: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  charityStats: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  charityStat: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: '#6B7280' },
  charityStatDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D1D5DB' },
  charityCheck: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E53935', alignItems: 'center', justifyContent: 'center' },
});
