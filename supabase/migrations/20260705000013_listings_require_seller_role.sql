-- The original insert policy only checked `seller_id = auth.uid()`, which
-- meant any signed-in buyer could create a listing for themselves without
-- ever going through seller onboarding. Require role = 'seller' (or admin).

drop policy if exists "sellers can create their own draft listings" on public.listings;

create policy "sellers can create their own draft listings"
  on public.listings for insert
  with check (
    auth.uid() = seller_id
    and status = 'draft'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('seller', 'admin')
    )
  );
