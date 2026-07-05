-- Luvlist (formerly "Wishlist" in the UI copy): listings a user has saved.

create table if not exists public.luvlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index if not exists luvlist_items_user_id_idx on public.luvlist_items (user_id);
create index if not exists luvlist_items_listing_id_idx on public.luvlist_items (listing_id);

alter table public.luvlist_items enable row level security;

create policy "users can read their own luvlist"
  on public.luvlist_items for select
  using (auth.uid() = user_id);

create policy "users can add to their own luvlist"
  on public.luvlist_items for insert
  with check (auth.uid() = user_id);

create policy "users can remove from their own luvlist"
  on public.luvlist_items for delete
  using (auth.uid() = user_id);
