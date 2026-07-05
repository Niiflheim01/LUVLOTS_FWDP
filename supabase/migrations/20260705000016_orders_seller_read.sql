-- Sellers can already read their own order_items (see
-- 20260705000007_orders_and_payments.sql), but the parent `orders` row
-- only had a buyer-owner read policy -- so a PostgREST nested embed of
-- order_items(*, orders(...)) returned null for sellers. Let a seller read
-- the (status/created_at only relevant) order row for any order that
-- contains one of their items.

create policy "sellers can read orders containing their items"
  on public.orders for select
  using (
    exists (
      select 1 from public.order_items oi
      where oi.order_id = orders.id and oi.seller_id = auth.uid()
    )
  );
