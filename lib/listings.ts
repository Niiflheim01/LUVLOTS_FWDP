import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';
import type { Listing, ListingCondition, ListingType } from '@/types/marketplace';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const LISTING_BUCKET = 'listing-images';

export type DraftListingInput = {
  title: string;
  description: string;
  categoryName: string;
  condition?: ListingCondition;
  price: number;
  currency?: string;
  listingType: ListingType;
};

export async function pickListingImage() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required to add listing images.');
  }

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
      condition: input.condition ?? 'excellent',
      price: input.price,
      currency: input.currency ?? 'PHP',
      listing_type: input.listingType,
      status: 'draft',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Listing;
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

  const response = await fetch(input.localUri);
  const blob = await response.blob();
  if (blob.size > MAX_IMAGE_BYTES) {
    throw new Error('Compressed image is still larger than 5 MB.');
  }
  if (!blob.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded.');
  }

  const fileName = `${Date.now()}-${input.sortOrder}.jpg`;
  const storagePath = `${userData.user.id}/${input.listingId}/${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from(LISTING_BUCKET)
    .upload(storagePath, blob, {
      cacheControl: '3600',
      contentType: blob.type || 'image/jpeg',
      upsert: false,
    });

  if (uploadError) throw uploadError;

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
