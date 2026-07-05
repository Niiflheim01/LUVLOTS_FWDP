-- Listing images: multiple images per listing, ordered, with ownership
-- tying back to the storage object path (see storage bucket policies in
-- 20260705000009_storage_buckets.sql).

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  storage_bucket text not null default 'listing-images',
  storage_path text not null,
  public_url text,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create index if not exists listing_images_listing_id_idx on public.listing_images (listing_id, sort_order);
create index if not exists listing_images_owner_id_idx on public.listing_images (owner_id);

create trigger listing_images_set_updated_at
  before update on public.listing_images
  for each row execute function public.set_updated_at();

alter table public.listing_images enable row level security;

-- Images for live listings are publicly visible (for browsing); an owner
-- can always see images on their own listings regardless of status.
create policy "listing images are readable when listing is live or owned"
  on public.listing_images for select
  using (
    owner_id = auth.uid()
    or exists (
      select 1 from public.listings l
      where l.id = listing_images.listing_id and l.status = 'live'
    )
  );

create policy "owners can add images to their own listings"
  on public.listing_images for insert
  with check (
    owner_id = auth.uid()
    and exists (
      select 1 from public.listings l
      where l.id = listing_images.listing_id and l.seller_id = auth.uid()
    )
  );

create policy "owners can reorder or edit alt text on their own images"
  on public.listing_images for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "owners can delete their own listing images"
  on public.listing_images for delete
  using (owner_id = auth.uid());
