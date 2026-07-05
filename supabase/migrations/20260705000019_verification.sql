-- Celebrity/Influencer verification badge.
--
-- There is no real ID/KYC verification pipeline yet (see
-- verification-documents bucket in 20260705000009, added for future use).
-- Rather than block every early user behind unbuilt manual review, anyone
-- who submits a verification request via request_verification() is granted
-- an immediate 'early_access' badge -- clearly distinguished from a fully
-- reviewed 'verified' badge, which a real admin queue will grant later once
-- KYC ships (approve_verification() / reject_verification() below already
-- exist for that transition).

alter table public.profiles
  add column if not exists verification_status text not null default 'none'
    check (verification_status in ('none', 'early_access', 'pending', 'verified', 'rejected')),
  add column if not exists verification_type text
    check (verification_type is null or verification_type in ('celebrity', 'influencer')),
  add column if not exists verification_note text,
  add column if not exists verification_document_url text,
  add column if not exists verification_requested_at timestamptz,
  add column if not exists verification_reviewed_at timestamptz;

-- Same self-elevation guard pattern as profiles_prevent_role_self_elevation
-- (20260705000011): direct client updates to verification_status are
-- blocked; only request_verification() / approve_verification() /
-- reject_verification() may change it, via the app.allow_verification_change
-- session flag.
create or replace function public.prevent_verification_self_elevation()
returns trigger
language plpgsql
as $$
begin
  if new.verification_status is distinct from old.verification_status then
    if coalesce(current_setting('app.allow_verification_change', true), 'false') <> 'true' then
      raise exception 'verification_status cannot be changed directly. Use request_verification().';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_verification_self_elevation on public.profiles;
create trigger profiles_prevent_verification_self_elevation
  before update on public.profiles
  for each row execute function public.prevent_verification_self_elevation();

-- Lets any signed-in user request a Celebrity/Influencer badge. Grants
-- 'early_access' immediately (see comment above); re-requesting just
-- refreshes the type/note/document and requested_at.
create or replace function public.request_verification(p_type text, p_note text default null, p_document_url text default null)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.profiles;
  existing_status text;
begin
  if p_type not in ('celebrity', 'influencer') then
    raise exception 'Verification type must be celebrity or influencer.';
  end if;

  select verification_status into existing_status from public.profiles where id = auth.uid();

  -- A manually-reviewed 'verified' badge shouldn't be silently swappable to
  -- a different type/evidence by another self-serve request -- that would
  -- let someone flip a real review's outcome without any re-review.
  if existing_status = 'verified' then
    raise exception 'Your verification is already confirmed. Contact support to change your verification details.';
  end if;

  perform set_config('app.allow_verification_change', 'true', true);

  update public.profiles
  set
    verification_type = p_type,
    verification_note = nullif(btrim(coalesce(p_note, '')), ''),
    verification_document_url = p_document_url,
    verification_requested_at = now(),
    verification_status = 'early_access'
  where id = auth.uid()
  returning * into target;

  perform set_config('app.allow_verification_change', 'false', true);

  if target is null then
    raise exception 'Profile not found.';
  end if;

  return target;
end;
$$;

grant execute on function public.request_verification(text, text, text) to authenticated;

-- Admin/moderator review path -- unused by the app today (no review queue
-- UI yet), but wired up now so flipping early_access -> verified later never
-- requires another RLS change, just a UI on top of these two functions.
create or replace function public.approve_verification(p_user_id uuid)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  target public.profiles;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role not in ('admin', 'moderator') then
    raise exception 'Only admins or moderators can approve verification requests.';
  end if;

  perform set_config('app.allow_verification_change', 'true', true);

  update public.profiles
  set verification_status = 'verified', verification_reviewed_at = now()
  where id = p_user_id
  returning * into target;

  perform set_config('app.allow_verification_change', 'false', true);

  if target is null then
    raise exception 'Profile not found.';
  end if;

  return target;
end;
$$;

grant execute on function public.approve_verification(uuid) to authenticated;

create or replace function public.reject_verification(p_user_id uuid, p_reason text default null)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role text;
  target public.profiles;
begin
  select role into caller_role from public.profiles where id = auth.uid();
  if caller_role not in ('admin', 'moderator') then
    raise exception 'Only admins or moderators can reject verification requests.';
  end if;

  perform set_config('app.allow_verification_change', 'true', true);

  update public.profiles
  set verification_status = 'rejected', verification_note = p_reason, verification_reviewed_at = now()
  where id = p_user_id
  returning * into target;

  perform set_config('app.allow_verification_change', 'false', true);

  if target is null then
    raise exception 'Profile not found.';
  end if;

  return target;
end;
$$;

grant execute on function public.reject_verification(uuid, text) to authenticated;

-- Expose verification fields on the public profile view so a verified
-- badge can render on listings/seller pages, not just the owner's own
-- Settings screen.
create or replace view public.public_profiles
  with (security_invoker = false) as
select id, username, full_name, avatar_url, role, created_at, verification_status, verification_type
from public.profiles;

grant select on public.public_profiles to anon, authenticated;
