import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  StyleSheet,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  Camera,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  ImageIcon,
  Tag,
  FileText,
  Eye,
  Gavel,
  ShoppingBag,
  Clock,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

import { createAuctionDraft } from '@/lib/auctions';
import {
  createListingDraft,
  deleteListingImage,
  getCategories,
  getListingById,
  moveListingToDraft,
  submitListingForReview,
  updateListingCoverImage,
  updateListingDraft,
  uploadListingImage,
  pickListingImage,
} from '@/lib/listings';
import { logError } from '@/lib/observability';
import type { ListingCondition } from '@/types/marketplace';

const { width: SCREEN_W } = Dimensions.get('window');
const MAX_IMAGES = 9;

const CONDITIONS: { value: ListingCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

const AUCTION_DURATIONS = [
  { hours: 24, label: '1 Day' },
  { hours: 72, label: '3 Days' },
  { hours: 120, label: '5 Days' },
  { hours: 168, label: '7 Days' },
];

type Category = { id: string; name: string; slug: string };
type ImageItem = { kind: 'new'; localUri: string } | { kind: 'existing'; id: string; url: string };
type ListingKind = 'instant_buy' | 'auction';

export default function AddProduct() {
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEditing = Boolean(editId);
  const [loadingExisting, setLoadingExisting] = useState(isEditing);
  const [originalAuctionEndsAt, setOriginalAuctionEndsAt] = useState<string | null>(null);
  const [originalStatus, setOriginalStatus] = useState<string | null>(null);
  const [durationTouched, setDurationTouched] = useState(false);
  const [listingKind, setListingKind] = useState<ListingKind>('instant_buy');
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [minIncrement, setMinIncrement] = useState('50');
  const [reservePrice, setReservePrice] = useState('');
  const [durationHours, setDurationHours] = useState(72);
  const [condition, setCondition] = useState<ListingCondition>('excellent');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [addingImage, setAddingImage] = useState(false);
  const [submitting, setSubmitting] = useState<'draft' | 'publish' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => logError(error, { area: 'AddProduct.getCategories' }));
  }, []);

  useEffect(() => {
    if (!editId) return;
    getListingById(editId)
      .then((listing) => {
        setListingKind(listing.listing_type === 'instant_buy' ? 'instant_buy' : 'auction');
        setProductName(listing.title);
        setDescription(listing.description ?? '');
        setPrice(String(listing.price));
        setComparePrice(listing.compare_at_price != null ? String(listing.compare_at_price) : '');
        setMinIncrement(String(listing.auction_min_increment ?? 50));
        setReservePrice(listing.auction_reserve_price != null ? String(listing.auction_reserve_price) : '');
        setOriginalAuctionEndsAt(listing.auction_ends_at ?? null);
        if (listing.auction_ends_at) {
          const hoursLeft = Math.round((new Date(listing.auction_ends_at).getTime() - Date.now()) / (60 * 60 * 1000));
          const closest = AUCTION_DURATIONS.reduce((best, d) =>
            Math.abs(d.hours - hoursLeft) < Math.abs(best.hours - hoursLeft) ? d : best,
          );
          setDurationHours(closest.hours);
        }
        setCondition(listing.condition ?? 'excellent');
        setCategoryId(listing.category_id ?? null);
        setOriginalStatus(listing.status);
        setImages(
          listing.images.map((img) => ({ kind: 'existing' as const, id: img.id, url: img.public_url ?? '' })),
        );
      })
      .catch((error) => {
        logError(error, { area: 'AddProduct.loadExisting' });
        Alert.alert('Could not load listing', 'Please try again.', [{ text: 'OK', onPress: () => router.back() }]);
      })
      .finally(() => setLoadingExisting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const priceValue = parseFloat(price);
  const minIncrementValue = parseFloat(minIncrement);
  const reservePriceValue = reservePrice ? parseFloat(reservePrice) : null;
  const isValid =
    productName.trim().length > 0 &&
    !Number.isNaN(priceValue) &&
    priceValue > 0 &&
    images.length > 0 &&
    (listingKind === 'instant_buy' || (!Number.isNaN(minIncrementValue) && minIncrementValue > 0));

  async function handleAddImage() {
    if (images.length >= MAX_IMAGES) return;
    setAddingImage(true);
    setErrorMessage(null);
    try {
      const picked = await pickListingImage();
      if (picked) {
        setImages((prev) => [...prev, { kind: 'new', localUri: picked.uri }]);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not add image.');
    } finally {
      setAddingImage(false);
    }
  }

  async function removeImage(index: number) {
    const item = images[index];
    if (item.kind === 'existing') {
      try {
        await deleteListingImage(item.id);
      } catch (error) {
        logError(error, { area: 'AddProduct.removeImage' });
        Alert.alert('Could not remove image', error instanceof Error ? error.message : 'Please try again.');
        return;
      }
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(mode: 'draft' | 'publish') {
    if (mode === 'publish' && !isValid) {
      Alert.alert(
        'Missing information',
        listingKind === 'auction'
          ? 'Please add a title, a starting bid greater than ₱0, a valid bid increment, and at least one photo.'
          : 'Please add a title, a price greater than ₱0, and at least one photo.',
      );
      return;
    }
    if (productName.trim().length === 0) {
      Alert.alert('Missing information', 'Please add a product title.');
      return;
    }

    setSubmitting(mode);
    setErrorMessage(null);
    try {
      const listing = isEditing && editId
        ? await updateListingDraft(editId, {
            title: productName,
            description,
            categoryId,
            condition,
            price: Number.isNaN(priceValue) ? 0 : priceValue,
            compareAtPrice: listingKind === 'instant_buy' ? (comparePrice ? parseFloat(comparePrice) : null) : null,
            auctionMinIncrement: listingKind === 'auction' ? (Number.isNaN(minIncrementValue) ? 50 : minIncrementValue) : undefined,
            auctionReservePrice: listingKind === 'auction' ? reservePriceValue : undefined,
            auctionEndsAt:
              listingKind === 'auction'
                ? durationTouched || !originalAuctionEndsAt
                  ? new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString()
                  : originalAuctionEndsAt
                : undefined,
          })
        : listingKind === 'auction'
          ? await createAuctionDraft({
              title: productName,
              description,
              categoryId,
              condition,
              startingPrice: Number.isNaN(priceValue) ? 0 : priceValue,
              minIncrement: Number.isNaN(minIncrementValue) ? 50 : minIncrementValue,
              reservePrice: reservePriceValue,
              durationHours,
            })
          : await createListingDraft({
              title: productName,
              description,
              categoryId,
              condition,
              price: Number.isNaN(priceValue) ? 0 : priceValue,
              compareAtPrice: comparePrice ? parseFloat(comparePrice) : null,
              listingType: 'instant_buy',
            });

      const newImages = images.filter((img): img is Extract<ImageItem, { kind: 'new' }> => img.kind === 'new');
      for (let i = 0; i < newImages.length; i++) {
        const uploaded = await uploadListingImage({
          listingId: listing.id,
          localUri: newImages[i].localUri,
          sortOrder: images.length - newImages.length + i,
        });
        if (i === 0 && images[0]?.kind === 'new') {
          await updateListingCoverImage(listing.id, uploaded.public_url);
        }
      }

      if (mode === 'publish') {
        if (originalStatus === 'archived') {
          await moveListingToDraft(listing.id);
        }
        await submitListingForReview(listing.id);
        Alert.alert(
          'Published!',
          listingKind === 'auction'
            ? 'Your auction is now live. Bidding closes automatically when the timer ends.'
            : 'Your listing is now live on LUVLOTS.',
        );
      } else {
        Alert.alert(isEditing ? 'Changes saved' : 'Draft saved', 'You can publish it later from My Products.');
      }

      router.back();
    } catch (error) {
      logError(error, { area: 'AddProduct.handleSubmit' });
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(null);
    }
  }

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

  const isSubmitting = submitting !== null;

  if (loadingExisting) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F5F8FA', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#4289AB" size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <LinearGradient colors={['#1A365D', '#2C5F8A']} style={s.header}>
        <SafeAreaView edges={['top']}>
          <View style={s.headerRow}>
            <Pressable onPress={() => router.back()} style={s.backBtn}>
              <ChevronLeft size={22} color="#fff" />
            </Pressable>
            <Text style={s.headerTitle}>
              {isEditing ? (listingKind === 'auction' ? 'Edit Auction' : 'Edit Product') : listingKind === 'auction' ? 'Create Auction' : 'Add Product'}
            </Text>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Animated.View entering={FadeInDown.delay(20).duration(400)} style={s.card}>
          <SectionHeader
            icon={<Tag size={16} color="#4289AB" />}
            title="Listing Type"
            subtitle={isEditing ? "Can't be changed after creation" : undefined}
          />
          <View style={s.listingTypeRow}>
            <Pressable
              disabled={isEditing}
              onPress={() => setListingKind('instant_buy')}
              style={[s.listingTypeCard, listingKind === 'instant_buy' && s.listingTypeCardActive, isEditing && { opacity: 0.6 }]}>
              <ShoppingBag size={20} color={listingKind === 'instant_buy' ? '#4289AB' : '#9CA3AF'} />
              <Text style={[s.listingTypeLabel, listingKind === 'instant_buy' && s.listingTypeLabelActive]}>Instant Buy</Text>
              <Text style={s.listingTypeSub}>Fixed price</Text>
            </Pressable>
            <Pressable
              disabled={isEditing}
              onPress={() => setListingKind('auction')}
              style={[s.listingTypeCard, listingKind === 'auction' && s.listingTypeCardActive, isEditing && { opacity: 0.6 }]}>
              <Gavel size={20} color={listingKind === 'auction' ? '#4289AB' : '#9CA3AF'} />
              <Text style={[s.listingTypeLabel, listingKind === 'auction' && s.listingTypeLabelActive]}>Auction</Text>
              <Text style={s.listingTypeSub}>Buyers bid</Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(400)} style={s.card}>
          <SectionHeader
            icon={<ImageIcon size={16} color="#4289AB" />}
            title="Product Images"
            subtitle={`Add up to ${MAX_IMAGES} images. First image will be the cover.`}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 12 }}>
            {images.map((img, i) => (
              <View key={(img.kind === 'existing' ? img.id : img.localUri) + i} style={s.imageThumb}>
                <Image source={{ uri: img.kind === 'existing' ? img.url : img.localUri }} style={s.thumbImg} />
                {i === 0 && (
                  <View style={s.coverBadge}>
                    <Text style={s.coverBadgeText}>Cover</Text>
                  </View>
                )}
                <Pressable style={s.removeImgBtn} onPress={() => removeImage(i)}>
                  <X size={10} color="#fff" />
                </Pressable>
              </View>
            ))}
            {images.length < MAX_IMAGES && (
              <Pressable style={s.addImageBtn} onPress={handleAddImage} disabled={addingImage}>
                {addingImage ? (
                  <ActivityIndicator size="small" color="#9CA3AF" />
                ) : (
                  <>
                    <Camera size={22} color="#9CA3AF" />
                    <Text style={s.addImageText}>{images.length}/{MAX_IMAGES}</Text>
                  </>
                )}
              </Pressable>
            )}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={s.card}>
          <SectionHeader icon={<FileText size={16} color="#4289AB" />} title="Basic Information" />

          <Text style={s.label}>Product Name *</Text>
          <TextInput style={s.input} placeholder="e.g. Signed Tour Jacket 2023" placeholderTextColor="#C4C4C4" value={productName} onChangeText={setProductName} />

          <Text style={s.label}>Description</Text>
          <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Describe your product..." placeholderTextColor="#C4C4C4" value={description} onChangeText={setDescription} multiline />

          <Text style={s.label}>Category</Text>
          <Pressable style={s.dropdownBtn} onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
            <Text style={selectedCategory ? s.dropdownValue : s.dropdownPlaceholder}>
              {selectedCategory?.name ?? 'Select category'}
            </Text>
            {showCategoryPicker ? <ChevronUp size={16} color="#9CA3AF" /> : <ChevronDown size={16} color="#9CA3AF" />}
          </Pressable>
          {showCategoryPicker && (
            <Animated.View entering={FadeIn.duration(200)} style={s.dropdownList}>
              {categories.map((cat) => (
                <Pressable key={cat.id} style={[s.dropdownItem, categoryId === cat.id && s.dropdownItemActive]} onPress={() => { setCategoryId(cat.id); setShowCategoryPicker(false); }}>
                  <Text style={[s.dropdownItemText, categoryId === cat.id && s.dropdownItemTextActive]}>{cat.name}</Text>
                  {categoryId === cat.id && <Check size={14} color="#4289AB" />}
                </Pressable>
              ))}
            </Animated.View>
          )}

          <Text style={s.label}>Condition</Text>
          <View style={s.conditionRow}>
            {CONDITIONS.map((c) => (
              <Pressable
                key={c.value}
                onPress={() => setCondition(c.value)}
                style={[s.conditionPill, condition === c.value && s.conditionPillActive]}>
                <Text style={[s.conditionPillText, condition === c.value && s.conditionPillTextActive]}>{c.label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(400)} style={s.card}>
          <SectionHeader icon={<Tag size={16} color="#4289AB" />} title={listingKind === 'auction' ? 'Starting Bid' : 'Pricing'} />

          {listingKind === 'auction' ? (
            <>
              <View style={s.rowFields}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Starting Bid (₱) *</Text>
                  <View style={s.currencyInput}>
                    <Text style={s.currencyPrefix}>₱</Text>
                    <TextInput style={s.currencyField} placeholder="0.00" placeholderTextColor="#C4C4C4" keyboardType="numeric" value={price} onChangeText={setPrice} />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Min. Bid Increment (₱) *</Text>
                  <View style={s.currencyInput}>
                    <Text style={s.currencyPrefix}>₱</Text>
                    <TextInput style={s.currencyField} placeholder="50" placeholderTextColor="#C4C4C4" keyboardType="numeric" value={minIncrement} onChangeText={setMinIncrement} />
                  </View>
                </View>
              </View>

              <Text style={s.label}>Reserve Price</Text>
              <View style={s.currencyInput}>
                <Text style={s.currencyPrefix}>₱</Text>
                <TextInput style={s.currencyField} placeholder="Optional -- won't sell below this" placeholderTextColor="#C4C4C4" keyboardType="numeric" value={reservePrice} onChangeText={setReservePrice} />
              </View>

              <View style={[s.sectionHeader, { marginTop: 16, marginBottom: 0 }]}>
                <View style={s.sectionIconWrap}><Clock size={16} color="#4289AB" /></View>
                <Text style={s.sectionTitle}>Auction Duration</Text>
              </View>
              <View style={s.conditionRow}>
                {AUCTION_DURATIONS.map((d) => (
                  <Pressable
                    key={d.hours}
                    onPress={() => { setDurationHours(d.hours); setDurationTouched(true); }}
                    style={[s.conditionPill, durationHours === d.hours && s.conditionPillActive]}>
                    <Text style={[s.conditionPillText, durationHours === d.hours && s.conditionPillTextActive]}>{d.label}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
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
                  <TextInput style={s.currencyField} placeholder="Optional" placeholderTextColor="#C4C4C4" keyboardType="numeric" value={comparePrice} onChangeText={setComparePrice} />
                </View>
              </View>
            </View>
          )}
        </Animated.View>

        {errorMessage ? (
          <Animated.View entering={FadeIn.duration(200)} style={s.errorCard}>
            <Text style={s.errorText}>{errorMessage}</Text>
          </Animated.View>
        ) : null}

        {(productName || price) ? (
          <Animated.View entering={FadeInDown.delay(240).duration(400)} style={s.card}>
            <SectionHeader icon={<Eye size={16} color="#4289AB" />} title="Product Preview" />
            <View style={s.previewCard}>
              <Image
                source={images[0] ? { uri: images[0].kind === 'existing' ? images[0].url : images[0].localUri } : undefined}
                style={s.previewImage}
              />
              <View style={s.previewInfo}>
                <Text style={s.previewName} numberOfLines={1}>{productName || 'Product Name'}</Text>
                <Text style={s.previewPrice}>₱{price ? parseFloat(price).toLocaleString() : '0'}</Text>
              </View>
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>

      <View style={s.bottomBar}>
        <SafeAreaView edges={['bottom']}>
          <View style={s.bottomRow}>
            <Pressable onPress={() => handleSubmit('draft')} disabled={isSubmitting} style={[s.saveDraftBtn, isSubmitting && { opacity: 0.6 }]}>
              {submitting === 'draft' ? <ActivityIndicator color="#4289AB" /> : <Text style={s.saveDraftText}>{isEditing ? 'Save Changes' : 'Save Draft'}</Text>}
            </Pressable>
            <Pressable style={[s.publishBtn, isSubmitting && { opacity: 0.6 }]} onPress={() => handleSubmit('publish')} disabled={isSubmitting}>
              <LinearGradient colors={['#4289AB', '#2C5F8A']} style={s.publishGradient}>
                {submitting === 'publish' ? <ActivityIndicator color="#fff" /> : <Text style={s.publishText}>{listingKind === 'auction' ? 'Publish Auction' : 'Publish Product'}</Text>}
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#fff' },

  card: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  sectionIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#EFF6FA', alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#1A365D' },
  sectionSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  listingTypeRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  listingTypeCard: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  listingTypeCardActive: { borderColor: '#4289AB', backgroundColor: '#EFF6FA' },
  listingTypeLabel: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#9CA3AF' },
  listingTypeLabelActive: { color: '#4289AB' },
  listingTypeSub: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#C4C4C4' },

  imageThumb: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  thumbImg: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#E5E7EB' },
  coverBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: '#4289AB', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  coverBadgeText: { fontFamily: 'Poppins_600SemiBold', fontSize: 8, color: '#fff' },
  removeImgBtn: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  addImageBtn: { width: 80, height: 80, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addImageText: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#9CA3AF' },

  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#4B5563', marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#333' },
  rowFields: { flexDirection: 'row', gap: 12 },
  currencyInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, overflow: 'hidden' },
  currencyPrefix: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#9CA3AF', paddingHorizontal: 12, backgroundColor: '#F3F4F6' },
  currencyField: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#333', paddingHorizontal: 10, paddingVertical: 12 },

  dropdownBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  dropdownValue: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#333' },
  dropdownPlaceholder: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#C4C4C4' },
  dropdownList: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginTop: 6, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownItemActive: { backgroundColor: '#EFF6FA' },
  dropdownItemText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#333' },
  dropdownItemTextActive: { fontFamily: 'Poppins_600SemiBold', color: '#4289AB' },

  conditionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  conditionPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  conditionPillActive: { borderColor: '#4289AB', backgroundColor: '#EFF6FA' },
  conditionPillText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#9CA3AF' },
  conditionPillTextActive: { color: '#4289AB' },

  errorCard: { backgroundColor: '#FEF2F2', marginHorizontal: 16, marginTop: 14, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FCA5A5' },
  errorText: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#B91C1C' },

  previewCard: { flexDirection: 'row', gap: 12, marginTop: 10, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  previewImage: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#E5E7EB' },
  previewInfo: { flex: 1, justifyContent: 'center' },
  previewName: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1A365D' },
  previewPrice: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#4289AB', marginTop: 2 },

  bottomBar: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingHorizontal: 16, paddingTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 10 },
  bottomRow: { flexDirection: 'row', gap: 12, paddingBottom: 4 },
  saveDraftBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#4289AB' },
  saveDraftText: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#4289AB' },
  publishBtn: { flex: 2, borderRadius: 14, overflow: 'hidden' },
  publishGradient: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14 },
  publishText: { fontFamily: 'Poppins_700Bold', fontSize: 14, color: '#fff' },
});
