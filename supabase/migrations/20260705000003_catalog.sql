-- Catalog reference tables: categories, designers, sustainable brands.
-- These are curated by the marketplace operator (service role / dashboard),
-- not by end users, so there are no client-facing insert/update policies.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.designers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.sustainable_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  description text,
  certification text,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.designers enable row level security;
alter table public.sustainable_brands enable row level security;

create policy "categories are publicly readable"
  on public.categories for select using (true);

create policy "designers are publicly readable"
  on public.designers for select using (true);

create policy "sustainable_brands are publicly readable"
  on public.sustainable_brands for select using (true);

-- Seed the five premium marketplace categories referenced throughout the app
-- (app/(tabs)/(store)/index.tsx). Safe to re-run.
insert into public.categories (name, slug, description) values
  ('Celebrity Drops', 'celebrity-drops', 'Items sold directly by celebrity sellers.'),
  ('Charity Auctions', 'charity-auctions', 'Auctions benefiting a partner cause.'),
  ('Sustainable Treasures', 'sustainable-treasures', 'Pre-loved pieces from sustainable brands.'),
  ('Designer Finds', 'designer-finds', 'Curated pieces from named designers.'),
  ('Curated Luxury', 'curated-luxury', 'Editorial picks across the marketplace.')
on conflict (slug) do nothing;
