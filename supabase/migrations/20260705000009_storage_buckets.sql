-- Storage buckets + policies.
--
-- listing-images:          public bucket. Files live at
--                           {user_id}/{listing_id}/{file_name}; public/signed
--                           URL choice is left to the app (currently public
--                           URLs, matching lib/listings.ts).
-- profile-images:          private bucket. Files live at {user_id}/{file_name}.
-- verification-documents:  private bucket, for seller ID/KYC uploads. Files
--                           live at {user_id}/{file_name}. Only the owner and
--                           admins/moderators can read these.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('listing-images', 'listing-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('profile-images', 'profile-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('verification-documents', 'verification-documents', false, 10485760, array['image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do nothing;

-- listing-images: anyone can view (bucket is public + listing_images RLS
-- above still gates which DB rows are exposed); only the owner (first path
-- segment = their user id) can upload/update/delete their own files.
create policy "listing images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "owners can upload their own listing images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owners can update their own listing images"
  on storage.objects for update
  using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owners can delete their own listing images"
  on storage.objects for delete
  using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- profile-images: private. Owner can read/write their own; the app should
-- serve these via signed URLs (supabase.storage.from('profile-images').createSignedUrl).
create policy "owners can view their own profile images"
  on storage.objects for select
  using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owners can upload their own profile images"
  on storage.objects for insert
  with check (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owners can update their own profile images"
  on storage.objects for update
  using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owners can delete their own profile images"
  on storage.objects for delete
  using (bucket_id = 'profile-images' and (storage.foldername(name))[1] = auth.uid()::text);

-- verification-documents: private, sensitive (KYC/ID). Owner can upload
-- their own; owner + admins/moderators can view (for manual review).
create policy "owners and moderators can view verification documents"
  on storage.objects for select
  using (
    bucket_id = 'verification-documents'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role in ('admin', 'moderator')
      )
    )
  );

create policy "owners can upload their own verification documents"
  on storage.objects for insert
  with check (bucket_id = 'verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "owners can delete their own verification documents"
  on storage.objects for delete
  using (bucket_id = 'verification-documents' and (storage.foldername(name))[1] = auth.uid()::text);
