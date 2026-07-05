-- Charity partner applications ("Become a Partner" form). A lightweight
-- lead-gen table -- reviewed manually by LUVLOTS staff (no admin UI yet;
-- query via the Supabase dashboard). Not the same as a `charities` table:
-- this only tracks applications, not approved/live partner orgs.

create table if not exists public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references public.profiles (id) on delete cascade,
  org_name text not null check (char_length(btrim(org_name)) > 0),
  org_type text not null,
  registration_number text not null,
  tax_number text,
  mission text not null,
  focus_areas text[] not null default '{}',
  website text,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  facebook text,
  instagram text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.partner_applications enable row level security;

create policy "applicants can read their own applications"
  on public.partner_applications for select
  using (auth.uid() = submitted_by);

create policy "applicants can submit their own applications"
  on public.partner_applications for insert
  with check (auth.uid() = submitted_by);
