-- Listings: the core marketplace entity, with a status state machine so
-- moderation can be switched on later (see app_settings.require_listing_moderation)
-- without touching the schema.

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) > 0),
  description text,
  category_id uuid references public.categories (id),
  designer_id uuid references public.designers (id),
  sustainable_brand_id uuid references public.sustainable_brands (id),
  condition text check (condition in ('new', 'like_new', 'excellent', 'good', 'fair')),
  price numeric(12, 2) not null check (price >= 0),
  currency text not null default 'PHP',
  listing_type text not null check (listing_type in ('instant_buy', 'auction', 'charity_auction')),
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'live', 'sold', 'archived', 'rejected')),
  cover_image_url text,
  moderation_notes text,
  rejected_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  sold_at timestamptz
);

create index if not exists listings_seller_id_idx on public.listings (seller_id);
create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_category_id_idx on public.listings (category_id);
create index if not exists listings_designer_id_idx on public.listings (designer_id);
create index if not exists listings_sustainable_brand_id_idx on public.listings (sustainable_brand_id);
create index if not exists listings_status_published_at_idx on public.listings (status, published_at desc);

create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- Server-side status state machine. Applies no matter which role performs
-- the update (client via RLS, or a SECURITY DEFINER RPC / service role from
-- an Edge Function), so an invalid transition is never possible.
create or replace function public.enforce_listing_status_transition()
returns trigger
language plpgsql
as $$
declare
  is_allowed boolean;
begin
  if new.status = old.status then
    return new;
  end if;

  is_allowed := case old.status
    when 'draft' then new.status in ('pending_review', 'live', 'archived')
    when 'pending_review' then new.status in ('live', 'rejected', 'draft')
    when 'rejected' then new.status in ('draft', 'pending_review')
    when 'live' then new.status in ('sold', 'archived')
    when 'archived' then new.status in ('draft')
    when 'sold' then false
    else false
  end;

  if not is_allowed then
    raise exception 'Invalid listing status transition: % -> %', old.status, new.status;
  end if;

  if new.status = 'live' and old.published_at is null then
    new.published_at := now();
  end if;

  if new.status = 'sold' then
    new.sold_at := now();
  end if;

  return new;
end;
$$;

create trigger listings_enforce_status_transition
  before update on public.listings
  for each row execute function public.enforce_listing_status_transition();

alter table public.listings enable row level security;

-- Public browsing/search/category/designer/brand/storefront pages must only
-- ever see status = 'live'. Sellers can additionally see all of their own
-- listings regardless of status (drafts, pending review, rejected, sold...).
create policy "live listings are publicly readable"
  on public.listings for select
  using (status = 'live' or auth.uid() = seller_id);

create policy "sellers can create their own draft listings"
  on public.listings for insert
  with check (auth.uid() = seller_id and status = 'draft');

-- Sellers may directly edit their own listing content, but a raw client
-- update can never itself result in 'pending_review' or 'live' -- those
-- transitions only happen through submit_listing_for_review() /
-- approve_listing(), which validate completeness first and run as the
-- migration owner (bypassing this policy).
create policy "sellers can edit their own editable listings"
  on public.listings for update
  using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id and status in ('draft', 'archived', 'rejected'));

create policy "sellers can delete their own draft listings"
  on public.listings for delete
  using (auth.uid() = seller_id and status = 'draft');

-- Validates required fields + images, then publishes (or queues for review
-- if app_settings.require_listing_moderation is enabled).
create or replace function public.submit_listing_for_review(listing_id uuid)
returns public.listings
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.listings;
  image_count int;
  moderation_enabled boolean;
begin
  select * into target from public.listings where id = listing_id;

  if target is null then
    raise exception 'Listing not found.';
  end if;

  if target.seller_id <> auth.uid() then
    raise exception 'You do not have permission to publish this listing.';
  end if;

  if target.status not in ('draft', 'rejected') then
    raise exception 'Only draft or rejected listings can be submitted for review.';
  end if;

  if char_length(btrim(target.title)) = 0 then
    raise exception 'Title is required.';
  end if;

  if target.price <= 0 then
    raise exception 'Price must be greater than zero.';
  end if;

  select count(*) into image_count from public.listing_images where listing_id = target.id;
  if image_count < 1 then
    raise exception 'At least one listing image is required.';
  end if;

  select coalesce((value)::boolean, false) into moderation_enabled
  from public.app_settings where key = 'require_listing_moderation';

  update public.listings
  set
    status = case when moderation_enabled then 'pending_review' else 'live' end,
    moderation_notes = null,
    rejected_reason = null
  where id = target.id
  returning * into target;

  return target;
end;
$$;

grant execute on function public.submit_listing_for_review(uuid) to authenticated;

create or replace function public.approve_listing(listing_id uuid)
returns public.listings
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  target public.listings;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role not in ('admin', 'moderator') then
    raise exception 'Only admins or moderators can approve listings.';
  end if;

  update public.listings
  set status = 'live', moderation_notes = null, rejected_reason = null
  where id = listing_id and status = 'pending_review'
  returning * into target;

  if target is null then
    raise exception 'Listing is not pending review.';
  end if;

  return target;
end;
$$;

grant execute on function public.approve_listing(uuid) to authenticated;

create or replace function public.reject_listing(listing_id uuid, reason text)
returns public.listings
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  target public.listings;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role not in ('admin', 'moderator') then
    raise exception 'Only admins or moderators can reject listings.';
  end if;

  update public.listings
  set status = 'rejected', rejected_reason = reason
  where id = listing_id and status = 'pending_review'
  returning * into target;

  if target is null then
    raise exception 'Listing is not pending review.';
  end if;

  return target;
end;
$$;

grant execute on function public.reject_listing(uuid, text) to authenticated;
