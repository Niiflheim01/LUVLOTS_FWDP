-- Addresses were entirely client-side mock state (Addresses.tsx/AddAddress.tsx
-- never persisted anything -- checkout always showed "No delivery address
-- saved yet." and the seller registration "pickup address" field had no
-- backing store at all). This is the real table both flows write to.

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) > 0),
  phone text not null check (char_length(btrim(phone)) > 0),
  region text,
  city text,
  postal_code text,
  street text not null check (char_length(btrim(street)) > 0),
  label text not null default 'Home' check (label in ('Home', 'Work', 'Other')),
  is_default boolean not null default false,
  is_pickup boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses (user_id);

create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

alter table public.addresses enable row level security;

create policy "users can read their own addresses"
  on public.addresses for select
  using (auth.uid() = user_id);

create policy "users can create their own addresses"
  on public.addresses for insert
  with check (auth.uid() = user_id);

create policy "users can update their own addresses"
  on public.addresses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users can delete their own addresses"
  on public.addresses for delete
  using (auth.uid() = user_id);

-- At most one default and one pickup address per user. The partial unique
-- indexes are the actual invariant; the trigger just unsets the previous
-- holder first so setting a new default/pickup address never hits a unique
-- violation.
create or replace function public.enforce_single_default_address()
returns trigger
language plpgsql
as $$
begin
  if new.is_default then
    update public.addresses set is_default = false
    where user_id = new.user_id and id <> new.id and is_default;
  end if;
  if new.is_pickup then
    update public.addresses set is_pickup = false
    where user_id = new.user_id and id <> new.id and is_pickup;
  end if;
  return new;
end;
$$;

create trigger addresses_enforce_single_default
  before insert or update on public.addresses
  for each row execute function public.enforce_single_default_address();

create unique index if not exists addresses_one_default_per_user
  on public.addresses (user_id) where is_default;
create unique index if not exists addresses_one_pickup_per_user
  on public.addresses (user_id) where is_pickup;
