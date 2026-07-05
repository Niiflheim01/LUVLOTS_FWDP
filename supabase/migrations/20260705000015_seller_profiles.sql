-- Seller-specific onboarding data, one-to-one with profiles. Separate from
-- `profiles` since this is seller-only metadata (shop name, contact info,
-- business type) that a buyer's profile has no use for.

create table if not exists public.seller_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  shop_name text not null check (char_length(btrim(shop_name)) > 0),
  shop_email text,
  shop_phone text,
  business_type text check (business_type in ('individual', 'business')),
  pickup_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger seller_profiles_set_updated_at
  before update on public.seller_profiles
  for each row execute function public.set_updated_at();

alter table public.seller_profiles enable row level security;

create policy "sellers can read their own seller profile"
  on public.seller_profiles for select
  using (auth.uid() = id);

create policy "sellers can create their own seller profile"
  on public.seller_profiles for insert
  with check (auth.uid() = id);

create policy "sellers can update their own seller profile"
  on public.seller_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
