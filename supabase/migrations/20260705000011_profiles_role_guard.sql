-- Security fix: the original "profiles are updatable by owner" policy
-- (20260705000002_profiles.sql) lets a user update every column on their
-- own row, including `role` -- meaning any signed-in user could currently
-- run `update profiles set role = 'admin' where id = auth.uid()` and
-- self-promote. This trigger blocks any direct role change; role changes
-- are only permitted when a trusted SECURITY DEFINER function explicitly
-- opts in via the `app.allow_role_change` session setting (which bypasses
-- RLS anyway, since such functions run as the migration owner).

create or replace function public.prevent_role_self_elevation()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role then
    if coalesce(current_setting('app.allow_role_change', true), 'false') <> 'true' then
      raise exception 'role cannot be changed directly. Use a dedicated function (e.g. become_seller()).';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_self_elevation on public.profiles;
create trigger profiles_prevent_role_self_elevation
  before update on public.profiles
  for each row execute function public.prevent_role_self_elevation();

-- Lets a signed-in buyer become a seller (used by the seller onboarding
-- flow's completion step). Deliberately narrow: only buyer -> seller,
-- never anything -> admin/moderator.
create or replace function public.become_seller()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.profiles;
begin
  perform set_config('app.allow_role_change', 'true', true);

  update public.profiles
  set role = 'seller'
  where id = auth.uid() and role = 'buyer'
  returning * into target;

  perform set_config('app.allow_role_change', 'false', true);

  if target is null then
    select * into target from public.profiles where id = auth.uid();
    if target is null then
      raise exception 'Profile not found.';
    end if;
    -- Already a seller (or some other role) -- return current state as a no-op.
  end if;

  return target;
end;
$$;

grant execute on function public.become_seller() to authenticated;
