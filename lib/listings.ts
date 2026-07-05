import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { ensureMediaLibraryPermission } from '@/lib/image-permissions';
import { supabase } from '@/lib/supabase';
import { uploadImageToBucket } from '@/lib/upload';
import type { Listing, ListingCondition, ListingImage, ListingType } from '@/types/marketplace';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const LISTING_BUCKET = 'listing-images';

export type DraftListingInput = {
  title: string;
  description: string;
  categoryId?: string | null;
  condition?: ListingCondition;
  price: number;
  compareAtPrice?: number | null;
  currency?: string;
  listingType: ListingType;
};

export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('id, name, slug').order('name');
  if (error) throw error;
  return data;
}

export type LiveListing = Listing & {
  categories: { name: string } | null;
  seller: { username: string | null; full_name: string | null; avatar_url: string | null } | null;
};

/**
 * Public browse query: live listings with their category, plus each
 * seller's public-safe profile fields merged in client-side (profiles has
 * owner-only RLS; public_profiles is the cross-user-readable view, but
 * PostgREST can't auto-embed a view without a real FK, so we batch-fetch
 * it separately and merge).
 */
export async function getLiveListings(options?: { listingType?: ListingType; sellerId?: string; limit?: number }) {
  let query = supabase
    .from('listings')
    .select('*, categories(name)')
    .eq('status', 'live')
    .order('published_at', { ascending: false })
    .limit(options?.limit ?? 20);

  if (options?.listingType) {
    query = query.eq('listing_type', options.listingType);
  }
  if (options?.sellerId) {
    query = query.eq('seller_id', options.sellerId);
  }

  const { data: listings, error } = await query;
  if (error) throw error;
  if (!listings || listings.length === 0) return [] as LiveListing[];

  const sellerIds = [...new Set(listings.map((l) => l.seller_id))];
  const { data: sellers } = await supabase
    .from('public_profiles')
    .select('id, username, full_name, avatar_url')
    .in('id', sellerIds);

  const sellerById = new Map((sellers ?? []).map((s) => [s.id, s]));

  return listings.map((listing) => ({
    ...listing,
    seller: sellerById.get(listing.seller_id) ?? null,
  })) as LiveListing[];
}

export async function getSellerProfile(sellerId: string) {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('id, username, full_name, avatar_url, role, created_at')
    .eq('id', sellerId)
    .single();

  if (error) throw error;
  return data;
}

export async function getListingsByIds(ids: string[]) {
  if (ids.length === 0) return [] as LiveListing[];

  const { data: listings, error } = await supabase
    .from('listings')
    .select('*, categories(name)')
    .in('id', ids);
  if (error) throw error;
  if (!listings || listings.length === 0) return [] as LiveListing[];

  const sellerIds = [...new Set(listings.map((l) => l.seller_id))];
  const { data: sellers } = await supabase
    .from('public_profiles')
    .select('id, username, full_name, avatar_url')
    .in('id', sellerIds);

  const sellerById = new Map((sellers ?? []).map((s) => [s.id, s]));

  return listings.map((listing) => ({
    ...listing,
    seller: sellerById.get(listing.seller_id) ?? null,
  })) as LiveListing[];
}

export async function getListingById(id: string) {
  const { data, error } = await supabase
    .from('listings')
    .select('*, categories(name)')
    .eq('id', id)
    .single();

  if (error) throw error;

  const { data: seller } = await supabase
    .from('public_profiles')
    .select('id, username, full_name, avatar_url')
    .eq('id', data.seller_id)
    .maybeSingle();

  const { data: images } = await supabase
    .from('listing_images')
    .select('*')
    .eq('listing_id', id)
    .order('sort_order');

  return { ...data, seller, images: images ?? [] } as LiveListing & { images: ListingImage[] };
}

export async function getMyListings() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in to view your listings.');

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Listing[];
}

export async function pickListingImage() {
  await ensureMediaLibraryPermission();

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.88,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) {
    throw new Error('Please choose an image under 5 MB.');
  }

  return ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: 1600 } }],
    {
      compress: 0.82,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );
}

export async function createListingDraft(input: DraftListingInput) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in to create a listing.');

  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: userData.user.id,
      title: input.title.trim(),
      description: input.description.trim() || null,
      category_id: input.categoryId ?? null,
      condition: input.condition ?? 'excellent',
      price: input.price,
      compare_at_price: input.compareAtPrice ?? null,
      currency: input.currency ?? 'PHP',
      listing_type: input.listingType,
      status: 'draft',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Listing;
}

export type ListingEditInput = {
  title: string;
  description: string;
  categoryId?: string | null;
  condition?: ListingCondition;
  price: number;
  compareAtPrice?: number | null;
  auctionMinIncrement?: number;
  auctionReservePrice?: number | null;
  auctionEndsAt?: string | null;
};

/**
 * Edits an existing listing's content in place, for drafts/rejected/archived
 * listings (the only statuses "sellers can edit their own editable listings"
 * -- 20260705000004_listings.sql -- allows a raw client update against).
 * listing_type is intentionally not editable here: an auction can't become
 * an instant_buy listing (or vice versa) after creation.
 */
export async function updateListingDraft(listingId: string, input: ListingEditInput) {
  const { data, error } = await supabase
    .from('listings')
    .update({
      title: input.title.trim(),
      description: input.description.trim() || null,
      category_id: input.categoryId ?? null,
      condition: input.condition ?? 'excellent',
      price: input.price,
      compare_at_price: input.compareAtPrice ?? null,
      auction_min_increment: input.auctionMinIncrement,
      auction_reserve_price: input.auctionReservePrice ?? null,
      auction_ends_at: input.auctionEndsAt ?? null,
    })
    .eq('id', listingId)
    .select('*')
    .single();

  if (error) throw error;
  return data as Listing;
}

export async function updateListingCoverImage(listingId: string, coverImageUrl: string) {
  const { error } = await supabase
    .from('listings')
    .update({ cover_image_url: coverImageUrl })
    .eq('id', listingId);

  if (error) throw error;
}

export async function uploadListingImage(input: {
  listingId: string;
  localUri: string;
  sortOrder: number;
  altText?: string;
}) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in to upload listing images.');

  const fileName = `${Date.now()}-${input.sortOrder}.jpg`;
  const storagePath = `${userData.user.id}/${input.listingId}/${fileName}`;
  await uploadImageToBucket({ bucket: LISTING_BUCKET, path: storagePath, localUri: input.localUri, contentType: 'image/jpeg' });

  const { data: publicData } = supabase.storage.from(LISTING_BUCKET).getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from('listing_images')
    .insert({
      listing_id: input.listingId,
      owner_id: userData.user.id,
      storage_bucket: LISTING_BUCKET,
      storage_path: storagePath,
      public_url: publicData.publicUrl,
      alt_text: input.altText ?? null,
      sort_order: input.sortOrder,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Real delete -- only valid for 'draft' listings per RLS ("sellers can
 * delete their own draft listings", 20260705000004_listings.sql). Anything
 * that has ever gone live must be archived instead (see archiveListing),
 * since a hard delete of a sold/live listing would orphan order_items.
 */
export async function deleteListing(listingId: string) {
  const { error } = await supabase.from('listings').delete().eq('id', listingId);
  if (error) throw error;
}

/**
 * Soft "unlist" -- moves a live listing to 'archived' so it drops out of
 * public browse/search while keeping its history intact. Only valid from
 * 'live' (see enforce_listing_status_transition, 20260705000004_listings.sql
 * -- pending_review/rejected/sold cannot go straight to archived).
 */
export async function archiveListing(listingId: string) {
  const { error } = await supabase.from('listings').update({ status: 'archived' }).eq('id', listingId);
  if (error) throw error;
}

/**
 * Sends a pending_review/rejected/archived listing back to 'draft' -- all
 * three of those transitions are allowed by the state machine, and 'draft'
 * is the only status a listing can be deleted from, so this is the path
 * back to deletable for anything that isn't currently 'live' or 'sold'.
 */
export async function moveListingToDraft(listingId: string) {
  const { error } = await supabase.from('listings').update({ status: 'draft' }).eq('id', listingId);
  if (error) throw error;
}

export async function submitListingForReview(listingId: string) {
  const { data, error } = await supabase.rpc('submit_listing_for_review', {
    listing_id: listingId,
  });

  if (error) throw error;
  return data;
}

export async function deleteListingImage(imageId: string) {
  const { data: image, error: fetchError } = await supabase
    .from('listing_images')
    .select('storage_bucket, storage_path')
    .eq('id', imageId)
    .single();

  if (fetchError) throw fetchError;

  if (image) {
    const { error: removeError } = await supabase.storage
      .from(image.storage_bucket)
      .remove([image.storage_path]);
    if (removeError) throw removeError;
  }

  const { error } = await supabase.rpc('delete_listing_image', {
    image_id: imageId,
  });

  if (error) throw error;
}

export async function reorderListingImages(images: { id: string; sortOrder: number }[]) {
  await Promise.all(
    images.map(({ id, sortOrder }) =>
      supabase.from('listing_images').update({ sort_order: sortOrder }).eq('id', id).then(({ error }) => {
        if (error) throw error;
      }),
    ),
  );
}
