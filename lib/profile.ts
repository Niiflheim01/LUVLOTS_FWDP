import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { ensureMediaLibraryPermission } from '@/lib/image-permissions';
import { supabase } from '@/lib/supabase';
import { uploadImageToBucket } from '@/lib/upload';
import type { Profile } from '@/types/marketplace';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const AVATAR_BUCKET = 'profile-images';

export async function pickAvatarImage() {
  await ensureMediaLibraryPermission();

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.88,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) {
    throw new Error('Please choose an image under 5 MB.');
  }

  return ImageManipulator.manipulateAsync(asset.uri, [{ resize: { width: 512, height: 512 } }], {
    compress: 0.85,
    format: ImageManipulator.SaveFormat.JPEG,
  });
}

export async function uploadAvatar(localUri: string): Promise<string> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in to update your profile photo.');

  const storagePath = `${userData.user.id}/avatar-${Date.now()}.jpg`;
  await uploadImageToBucket({ bucket: AVATAR_BUCKET, path: storagePath, localUri, contentType: 'image/jpeg' });

  const { data: publicData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(storagePath);
  return publicData.publicUrl;
}

export async function updateMyProfile(input: { fullName?: string; bio?: string; avatarUrl?: string }): Promise<Profile> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in to update your profile.');

  const updates: Record<string, unknown> = {};
  if (input.fullName !== undefined) updates.full_name = input.fullName;
  if (input.bio !== undefined) updates.bio = input.bio;
  if (input.avatarUrl !== undefined) updates.avatar_url = input.avatarUrl;

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userData.user.id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Profile;
}
