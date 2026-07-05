-- Adds an optional "compare at" price for showing a struck-through
-- original price on a listing card (a discount/deal indicator), used by
-- the Add Product flow and seller dashboard product list.

alter table public.listings
  add column if not exists compare_at_price numeric(12, 2) check (compare_at_price is null or compare_at_price >= 0);
