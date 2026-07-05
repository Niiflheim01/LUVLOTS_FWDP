-- Fixes "infinite recursion detected in policy for relation orders".
--
-- The "sellers can read orders containing their items" policy queried
-- order_items directly inside its USING clause. But order_items has its
-- own RLS policy ("buyers can read their own order items") that queries
-- back into orders -- so reading orders -> triggers order_items RLS ->
-- queries orders again -> infinite loop.
--
-- Fix: move the check into a SECURITY DEFINER function. Such functions run
-- as their owner (the migration role, which bypasses RLS), so the internal
-- order_items lookup never re-triggers order_items' own RLS policies,
-- breaking the recursion.

create or replace function public.order_has_seller_item(target_order_id uuid, target_seller_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.order_items oi
    where oi.order_id = target_order_id and oi.seller_id = target_seller_id
  );
$$;

drop policy if exists "sellers can read orders containing their items" on public.orders;

create policy "sellers can read orders containing their items"
  on public.orders for select
  using (public.order_has_seller_item(orders.id, auth.uid()));
