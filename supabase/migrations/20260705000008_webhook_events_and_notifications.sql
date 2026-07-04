-- Webhook events: append-only audit log for every G8 Pay webhook delivery,
-- keyed on the provider's event id so re-delivered webhooks are idempotent
-- (handled in supabase/functions/g8-pay-webhook, which upserts here and
-- exits early if provider_event_id already exists and was processed).
--
-- No RLS policies are defined for any role other than the service role
-- (which bypasses RLS entirely) -- clients have zero access to this table.

create table if not exists public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'g8_pay',
  provider_event_id text not null,
  payload jsonb not null,
  signature_verified boolean not null default false,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

alter table public.payment_webhook_events enable row level security;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "users can read their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- Users may only mark their own notifications as read (or unread), not
-- change the content -- inserts are service-role only (Edge Functions),
-- matching the FCM/order-update/auction-activity integration points
-- described in the project brief.
create policy "users can mark their own notifications read"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
