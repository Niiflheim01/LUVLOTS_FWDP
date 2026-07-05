-- Profiles: one row per Supabase Auth user.
-- Split into a private base table (owner-only read/write) and a public view
-- exposing only the fields the marketplace UI needs to render seller/buyer
-- names on listings, orders, etc.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  username text unique,
  avatar_url text,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin', 'moderator')),
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

alter table public.profiles enable row level security;

-- Owners can read and edit their own full profile (private fields included).
create policy "profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Public-facing view: only the fields needed for marketplace display
-- (seller name/avatar on a listing, buyer name on a review, etc).
-- Views in Postgres run with the privileges of their owner by default
-- (security_invoker = false), so this view can read every row even though
-- the base table's RLS only allows owners to read their own row directly.
create or replace view public.public_profiles
  with (security_invoker = false) as
select id, username, full_name, avatar_url, role, created_at
from public.profiles;

grant select on public.public_profiles to anon, authenticated;

-- Safety net: auto-create a minimal profile row when a new auth user is
-- created, in case the client-side upsert (see lib/auth-context.tsx) never
-- runs (app killed mid sign-up, etc). The client upsert still runs
-- afterwards and fills in the rest via `onConflict: 'id'`.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Fall back username includes a slice of the user id so two people with
  -- the same email local-part (different domains) don't collide on the
  -- unique username constraint. Users can change it later in Edit Profile.
  insert into public.profiles (id, full_name, username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(
      new.raw_user_meta_data ->> 'username',
      lower(split_part(new.email, '@', 1)) || '-' || substr(new.id::text, 1, 8)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
