-- delete_listing_image: removes the DB row for an image the caller owns.
-- The storage object itself is removed by the client via
-- supabase.storage.from(bucket).remove([path]) *before* calling this RPC
-- (see lib/listings.ts) -- that goes through the Storage API so the actual
-- file is deleted, not just its metadata row.

create or replace function public.delete_listing_image(image_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.listing_images;
begin
  select * into target from public.listing_images where id = image_id;

  if target is null then
    raise exception 'Listing image not found.';
  end if;

  if target.owner_id <> auth.uid() then
    raise exception 'You do not have permission to delete this image.';
  end if;

  delete from public.listing_images where id = image_id;
end;
$$;

grant execute on function public.delete_listing_image(uuid) to authenticated;
