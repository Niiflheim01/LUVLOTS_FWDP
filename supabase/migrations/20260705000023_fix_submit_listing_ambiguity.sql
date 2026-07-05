-- Bugfix: submit_listing_for_review() failed at publish time with
-- `column reference "listing_id" is ambiguous` (SQLSTATE 42702). The
-- function's parameter is named `listing_id`, and the image-count query
-- `... from public.listing_images where listing_id = target.id` left
-- `listing_id` ambiguous between the parameter and
-- public.listing_images.listing_id (Postgres' default variable_conflict is
-- `error`). This has been latent since 20260705000004 and was re-emitted by
-- the auction rewrite in 20260705000021 -- fixed here by fully qualifying
-- the column. Function body is otherwise identical to the 20260705000021
-- version (auction end-time validation included).

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

  select count(*) into image_count
  from public.listing_images
  where public.listing_images.listing_id = target.id;

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
