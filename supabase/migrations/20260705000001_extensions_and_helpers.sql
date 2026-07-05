-- Extensions & shared helper functions used by every later migration.

create extension if not exists pgcrypto;

-- Generic updated_at maintenance trigger, reused by every table below.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Non-sensitive runtime config (e.g. moderation on/off) readable by everyone,
-- writable only by the service role (Supabase dashboard / SQL editor / migrations).
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

create policy "app_settings are publicly readable"
  on public.app_settings for select
  using (true);

insert into public.app_settings (key, value)
values ('require_listing_moderation', 'false'::jsonb)
on conflict (key) do nothing;
