-- Avatars need to be visible to OTHER users (shown next to a seller's name
-- on listings, in public_profiles, etc), unlike verification-documents
-- which are genuinely sensitive. Flip profile-images to a public-read
-- bucket (write/delete stay owner-only, per the existing policies from
-- 20260705000009_storage_buckets.sql).

update storage.buckets set public = true where id = 'profile-images';

create policy "profile images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'profile-images');
