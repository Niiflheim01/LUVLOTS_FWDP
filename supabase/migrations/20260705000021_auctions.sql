-- Auction/bidding support. listing_type already allowed 'auction' and
-- 'charity_auction' (20260705000004) but nothing used it -- BiddingScreen
-- was a "Coming Soon" placeholder. This adds the auction-specific columns,
-- the bids table, and the RPCs that make bidding actually work end to end.
--
-- Design: `price` stays the auction's starting price (set once at listing
-- creation, same column instant_buy listings use). `current_bid_amount` /
-- `current_bid_id` / `bid_count` track live state and are only ever written
-- by place_bid() (SECURITY DEFINER, runs as table owner so it bypasses the
-- "sellers can edit their own editable listings" policy that otherwise
-- would block edits to a 'live' listing).

alter table public.listings
  add column if not exists auction_ends_at timestamptz,
  add column if not exists auction_min_increment numeric(12, 2) not null default 50
    check (auction_min_increment > 0),
  add column if not exists auction_reserve_price numeric(12, 2)
    check (auction_reserve_price is null or auction_reserve_price >= 0),
  add column if not exists current_bid_amount numeric(12, 2),
  add column if not exists current_bid_id uuid,
  add column if not exists bid_count integer not null default 0;

create table if not exists public.bids (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  bidder_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists bids_listing_id_idx on public.bids (listing_id, amount desc);
create index if not exists bids_bidder_id_idx on public.bids (bidder_id);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'listings_current_bid_id_fkey') then
    alter table public.listings
      add constraint listings_current_bid_id_fkey foreign key (current_bid_id) references public.bids (id);
  end if;
end
$$;

alter table public.bids enable row level security;

-- Bid history is part of an auction's public trust signal (shows the
-- listing isn't a single shill bid), so any signed-in user can read it.
-- There is deliberately no insert policy: all bids must go through
-- place_bid(), which validates timing/amount/self-bidding atomically under
-- a row lock before writing anything.
create policy "authenticated users can read bids"
  on public.bids for select
  to authenticated
  using (true);

create or replace function public.place_bid(p_listing_id uuid, p_amount numeric)
returns public.bids
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.listings;
  min_required numeric;
  new_bid public.bids;
begin
  if p_amount <= 0 then
    raise exception 'Bid amount must be greater than zero.';
  end if;

  select * into target from public.listings where id = p_listing_id for update;

  if target is null then
    raise exception 'Listing not found.';
  end if;

  if target.listing_type not in ('auction', 'charity_auction') then
    raise exception 'This listing is not an auction.';
  end if;

  if target.status <> 'live' then
    raise exception 'This auction is not currently live.';
  end if;

  if target.auction_ends_at is null or now() >= target.auction_ends_at then
    raise exception 'This auction has already ended.';
  end if;

  if target.seller_id = auth.uid() then
    raise exception 'You cannot bid on your own listing.';
  end if;

  min_required := coalesce(target.current_bid_amount + target.auction_min_increment, target.price);

  if p_amount < min_required then
    raise exception 'Your bid must be at least % %.', target.currency, min_required;
  end if;

  insert into public.bids (listing_id, bidder_id, amount)
  values (p_listing_id, auth.uid(), p_amount)
  returning * into new_bid;

  update public.listings
  set current_bid_amount = p_amount, current_bid_id = new_bid.id, bid_count = bid_count + 1
  where id = p_listing_id;

  return new_bid;
end;
$$;

grant execute on function public.place_bid(uuid, numeric) to authenticated;

-- There is no scheduled job runner in this project yet, so auctions are
-- closed lazily: the client calls this once whenever it loads the live
-- auctions feed or a single auction (see lib/auctions.ts). Safe to expose to
-- any authenticated user since it only ever acts on already-expired
-- listings and the outcome is fully determined by existing bid state.
create or replace function public.close_expired_auctions()
returns setof public.listings
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.listings
  set status = case
    when bid_count > 0 and (auction_reserve_price is null or current_bid_amount >= auction_reserve_price)
      then 'sold'
    else 'archived'
  end
  where listing_type in ('auction', 'charity_auction')
    and status = 'live'
    and auction_ends_at is not null
    and auction_ends_at <= now()
  returning *;
end;
$$;

grant execute on function public.close_expired_auctions() to authenticated;

-- submit_listing_for_review must additionally require an end time (in the
-- future) before an auction goes live -- instant_buy listings are
-- unaffected.
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

  if target.listing_type in ('auction', 'charity_auction') then
    if target.auction_ends_at is null or target.auction_ends_at <= now() then
      raise exception 'Auction end time must be set in the future.';
    end if;
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

-- Checkout must also work for a won auction: status is 'sold' (not 'live')
-- and the price actually owed is the winning bid, not the starting price.
-- Only the winning bidder may create the order_item for it.
create or replace function public.snapshot_order_item_from_listing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_listing public.listings;
begin
  select * into target_listing from public.listings where id = new.listing_id;

  if target_listing is null then
    raise exception 'Listing is not available for purchase.';
  end if;

  if target_listing.listing_type in ('auction', 'charity_auction') then
    if target_listing.status <> 'sold' or target_listing.current_bid_id is null then
      raise exception 'This auction has not concluded yet.';
    end if;

    if not exists (
      select 1 from public.bids b
      where b.id = target_listing.current_bid_id and b.bidder_id = auth.uid()
    ) then
      raise exception 'Only the winning bidder can check out this item.';
    end if;

    -- Unlike instant_buy (where nothing yet flips status on order creation,
    -- a pre-existing gap this migration doesn't attempt to fix), an auction
    -- is already in its final 'sold' state the moment it closes, with a
    -- single deterministic winner -- so only one non-cancelled order_item
    -- may ever exist for it, or the winner could pay for the same win
    -- twice. A cancelled/refunded prior attempt doesn't count, so a retry
    -- after an abandoned checkout still works.
    if exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.listing_id = target_listing.id and o.status not in ('cancelled', 'refunded')
    ) then
      raise exception 'This item has already been checked out.';
    end if;

    new.unit_price := target_listing.current_bid_amount;
  else
    if target_listing.status <> 'live' then
      raise exception 'Listing is not available for purchase.';
    end if;

    new.unit_price := target_listing.price;
  end if;

  new.seller_id := target_listing.seller_id;
  new.currency := target_listing.currency;

  return new;
end;
$$;
