import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { ensureMediaLibraryPermission } from '@/lib/image-permissions';
import { supabase } from '@/lib/supabase';
import { uploadImageToBucket } from '@/lib/upload';
import type { Profile, VerificationType } from '@/types/marketplace';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const VERIFICATION_BUCKET = 'verification-documents';

export async function pickVerificationImage() {
  await ensureMediaLibraryPermission();

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    quality: 0.88,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) {
    throw new Error('Please choose an image under 10 MB.');
  }

  return ImageManipulator.manipulateAsync(asset.uri, [{ resize: { width: 1600 } }], {
    compress: 0.85,
    format: ImageManipulator.SaveFormat.JPEG,
  });
}

/**
 * Uploads to the private verification-documents bucket (owner + admins/mods
 * only, see 20260705000009_storage_buckets.sql) and returns the storage
 * path -- not a public URL, since this bucket has no public read policy.
 * Callers that need to display it back to the owner should use
 * getVerificationDocumentSignedUrl().
 */
export async function uploadVerificationDocument(localUri: string, kind: 'seller-id' | 'verification'): Promise<string> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in to upload a document.');

  const storagePath = `${userData.user.id}/${kind}-${Date.now()}.jpg`;
  await uploadImageToBucket({ bucket: VERIFICATION_BUCKET, path: storagePath, localUri, contentType: 'image/jpeg' });
  return storagePath;
}

export async function getVerificationDocumentSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from(VERIFICATION_BUCKET).createSignedUrl(storagePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export async function requestVerification(input: { type: VerificationType; note?: string; documentPath?: string }): Promise<Profile> {
  const { data, error } = await supabase.rpc('request_verification', {
    p_type: input.type,
    p_note: input.note ?? null,
    p_document_url: input.documentPath ?? null,
  });

  if (error) throw error;
  return data as Profile;
}
