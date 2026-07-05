import { supabase } from '@/lib/supabase';

/**
 * Uploads a local image file to a Supabase Storage bucket.
 *
 * IMPORTANT: on React Native, `fetch(fileUri).then(r => r.blob())` frequently
 * yields a 0-byte / empty-typed Blob, which uploads "successfully" but stores
 * an empty file (the "uploaded photo is blank" bug). The reliable pattern is
 * a multipart FormData with the `{ uri, name, type }` file object -- RN's
 * networking layer streams the real file bytes for it. Works in Expo Go with
 * no extra native dependency.
 */
export async function uploadImageToBucket(input: {
  bucket: string;
  path: string;
  localUri: string;
  contentType?: string;
  upsert?: boolean;
}) {
  const contentType = input.contentType ?? 'image/jpeg';
  const fileName = input.path.split('/').pop() ?? 'upload.jpg';

  const formData = new FormData();
  formData.append('file', {
    uri: input.localUri,
    name: fileName,
    type: contentType,
  } as unknown as Blob);

  const { error } = await supabase.storage.from(input.bucket).upload(input.path, formData, {
    cacheControl: '3600',
    contentType,
    upsert: input.upsert ?? false,
  });

  if (error) throw error;
}
