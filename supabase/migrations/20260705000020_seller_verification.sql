-- Seller identity verification (KYC) is not built yet -- there is no admin
-- review queue, so every new seller_profiles row is granted 'early_access'
-- by default (see becomeAsSeller flow in lib/seller.ts / BusinessInfo.tsx),
-- with the optional government ID stashed in the private
-- verification-documents bucket for whenever manual/automated KYC review
-- ships. This mirrors the profiles verification_status pattern in
-- 20260705000019 but is scoped to seller_profiles since it's about payout
-- trust, not the public celebrity/influencer badge.

alter table public.seller_profiles
  add column if not exists id_document_url text,
  add column if not exists verification_status text not null default 'early_access'
    check (verification_status in ('early_access', 'pending', 'verified', 'rejected')),
  add column if not exists verification_reviewed_at timestamptz;

-- A client-owned upsert could otherwise set verification_status straight to
-- 'verified' on creation (RLS only checks auth.uid() = id). Require new rows
-- to start at 'early_access', and block direct updates to the column
-- afterwards -- only approve_seller_verification()/reject_seller_verification()
-- (via the app.allow_seller_verification_change flag) may change it later.
drop policy if exists "sellers can create their own seller profile" on public.seller_profiles;
create policy "sellers can create their own seller profile"
  on public.seller_profiles for insert
  with check (auth.uid() = id and verification_status = 'early_access');

create or replace function public.prevent_seller_verification_self_elevation()
returns trigger
language plpgsql
as $$
begin
  if new.verification_status is distinct from old.verification_status then
    if coalesce(current_setting('app.allow_seller_verification_change', true), 'false') <> 'true' then
      raise exception 'verification_status cannot be changed directly.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists seller_profiles_prevent_verification_self_elevation on public.seller_profiles;
create trigger seller_profiles_prevent_verification_self_elevation
  before update on public.seller_profiles
  for each row execute function public.prevent_seller_verification_self_elevation();

create or replace function public.approve_seller_verification(p_seller_id uuid)
returns public.seller_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  target public.seller_profiles;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role not in ('admin', 'moderator') then
    raise exception 'Only admins or moderators can approve seller verification.';
  end if;

  perform set_config('app.allow_seller_verification_change', 'true', true);

  update public.seller_profiles
  set verification_status = 'verified', verification_reviewed_at = now()
  where id = p_seller_id
  returning * into target;

  perform set_config('app.allow_seller_verification_change', 'false', true);

  if target is null then
    raise exception 'Seller profile not found.';
  end if;

  return target;
end;
$$;

grant execute on function public.approve_seller_verification(uuid) to authenticated;
