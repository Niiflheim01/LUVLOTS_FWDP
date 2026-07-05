-- Orders, order items, and payment attempts.
--
-- Flow: buyer creates an `orders` row (their own, status='pending'), then
-- `order_items` rows referencing listings they want to buy. A BEFORE INSERT
-- trigger snapshots price/currency/seller_id straight from the listing so a
-- buyer can never submit a tampered price. The client then calls the
-- `g8-pay-create-checkout` Edge Function (service role), which creates the
-- `payment_attempts` row itself -- clients cannot insert/update payment
-- attempts directly, since a verified webhook is the only source of truth
-- for payment success (see 20260705000008 and supabase/functions/g8-pay-webhook).

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'awaiting_payment', 'paid', 'cancelled', 'refunded', 'fulfilled')),
  subtotal numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  currency text not null default 'PHP',
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_buyer_id_idx on public.orders (buyer_id);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;

create policy "buyers can read their own orders"
  on public.orders for select
  using (auth.uid() = buyer_id);

create policy "buyers can create their own orders"
  on public.orders for insert
  with check (auth.uid() = buyer_id and status = 'pending');

create policy "buyers can cancel their own pending orders"
  on public.orders for update
  using (auth.uid() = buyer_id and status = 'pending')
  with check (auth.uid() = buyer_id and status in ('pending', 'cancelled'));

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  listing_id uuid not null references public.listings (id),
  seller_id uuid not null references public.profiles (id),
  quantity int not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null,
  currency text not null,
  created_at timestamptz not null default now()
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_seller_id_idx on public.order_items (seller_id);
create index if not exists order_items_listing_id_idx on public.order_items (listing_id);

alter table public.order_items enable row level security;

create policy "buyers can read their own order items"
  on public.order_items for select
  using (
    exists (select 1 from public.orders o where o.id = order_items.order_id and o.buyer_id = auth.uid())
  );

create policy "sellers can read order items for their own listings"
  on public.order_items for select
  using (seller_id = auth.uid());

-- Buyers can only add items to orders they own; price/currency/seller_id
-- are always overwritten server-side from the live listing (see trigger
-- below), so a client can never submit its own price.
create policy "buyers can add items to their own pending orders"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.buyer_id = auth.uid() and o.status = 'pending'
    )
  );

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

  if target_listing is null or target_listing.status <> 'live' then
    raise exception 'Listing is not available for purchase.';
  end if;

  new.seller_id := target_listing.seller_id;
  new.unit_price := target_listing.price;
  new.currency := target_listing.currency;

  return new;
end;
$$;

create trigger order_items_snapshot_from_listing
  before insert on public.order_items
  for each row execute function public.snapshot_order_item_from_listing();

create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete set null,
  buyer_id uuid not null references public.profiles (id),
  seller_id uuid references public.profiles (id),
  listing_id uuid references public.listings (id),
  provider text not null default 'g8_pay' check (provider in ('g8_pay')),
  provider_transaction_id text,
  amount numeric(12, 2) not null check (amount >= 0),
  currency text not null default 'PHP',
  status text not null default 'created'
    check (status in ('created', 'pending', 'requires_action', 'paid', 'failed', 'cancelled', 'expired', 'refunded')),
  checkout_url text,
  provider_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_attempts_order_id_idx on public.payment_attempts (order_id);
create index if not exists payment_attempts_buyer_id_idx on public.payment_attempts (buyer_id);
create unique index if not exists payment_attempts_provider_txn_idx
  on public.payment_attempts (provider, provider_transaction_id)
  where provider_transaction_id is not null;

create trigger payment_attempts_set_updated_at
  before update on public.payment_attempts
  for each row execute function public.set_updated_at();

alter table public.payment_attempts enable row level security;

-- Read-only for buyers; there is intentionally no insert/update/delete
-- policy for authenticated/anon roles. Only the service role (used from
-- the g8-pay-* Edge Functions) can write to this table, so the client can
-- never fabricate a "paid" status -- the webhook handler is the only path
-- that can mark a payment as paid.
create policy "buyers can read their own payment attempts"
  on public.payment_attempts for select
  using (auth.uid() = buyer_id);
