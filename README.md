# Luvlots

A React Native / Expo mobile marketplace app featuring celebrity-seller storefronts, charity auctions, live selling, and a full cart/checkout flow.

---

## Prerequisites

Make sure the following are installed before you run anything.

### All platforms

| Tool | Minimum version | How to check |
|------|----------------|--------------|
| Node.js | 20 LTS | `node -v` |
| npm | 10+ (ships with Node 20) | `npm -v` |
| Git | any | `git --version` |

Install Node.js from [nodejs.org](https://nodejs.org/) (choose the **LTS** release).

### Android

- **Android Studio** with the Android SDK (API level 33+)
- An Android emulator **or** a physical Android device with USB debugging enabled
- `ANDROID_HOME` environment variable pointing to your SDK directory

### iOS (Mac only)

- **Xcode** 15+ from the Mac App Store
- Xcode Command Line Tools: `xcode-select --install`
- **CocoaPods**: `sudo gem install cocoapods`
- An iOS simulator **or** a physical iPhone/iPad

### Physical device (quick option — no emulator needed)

Install **Expo Go** on your phone:
- Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

You can scan the QR code from `npm run dev` to open the app instantly.

---

## Getting started

```bash
# 1. Clone the repo
git clone <repo-url>
cd luvlots

# 2. Install dependencies
npm install

# 3. Start the dev server (clears Expo cache)
npm run dev
```

The Metro bundler will start and print a QR code. Then:

- **Expo Go (phone)** — scan the QR code
- **Android emulator** — press `a` in the terminal
- **iOS simulator (Mac only)** — press `i` in the terminal
- **Web browser** — press `w` in the terminal

---

## Available scripts

| Script | What it does |
|--------|-------------|
| `npm start` | Start Metro without clearing cache |
| `npm run dev` | Start Metro and clear Expo cache (recommended after pulling changes) |
| `npm run android` | Open on Android emulator / connected device |
| `npm run ios` | Open on iOS simulator (Mac only) |
| `npm run web` | Open in browser |
| `npm run clean` | Clear Expo build cache |
| `npm run typecheck` | Run TypeScript type checking without building |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | [Expo](https://expo.dev) SDK 54 + New Architecture |
| Navigation | [Expo Router](https://expo.github.io/router) v6 (file-based) |
| Styling | [NativeWind](https://www.nativewind.dev) v4 (Tailwind for RN) |
| Animations | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) v4 |
| Icons | [Lucide React Native](https://lucide.dev) + Expo Vector Icons |
| Fonts | Poppins (via `@expo-google-fonts/poppins`) |
| UI Primitives | React Native Reusables / RN Primitives |
| Backend | [Supabase](https://supabase.com) (Auth, Postgres, Storage, Edge Functions) |
| Payments | G8 Pay / Ganap (server-side only, via Supabase Edge Functions) |

---

## Backend setup (Supabase)

The app talks to a Supabase project for authentication, the database, file
storage, and payment Edge Functions. Nothing here is optional for real
sign-in/listings/Luvlist to work — without it the app falls back to a
"Supabase is not configured" state on any auth/database action.

### 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. Note your **Project URL** and **anon public key** (Project Settings → API).

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in at minimum:

```
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Expo automatically inlines any `EXPO_PUBLIC_*` variable from `.env` into the
client bundle (see `lib/env.ts`) — no `app.json` changes needed. **Never**
put the Supabase **service role** key or any G8 Pay secret in an
`EXPO_PUBLIC_*` variable; those are server-side only (see step 5).

### 3. Run the database migrations

All schema, indexes, RLS policies, and storage bucket setup live in
[`supabase/migrations/`](supabase/migrations), in run order. With the
[Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Or paste each file's contents into the Supabase Dashboard's **SQL Editor**,
in filename order (`20260705000001_...` through `20260705000010_...`).

This creates: `profiles`, `categories`, `designers`, `sustainable_brands`,
`listings`, `listing_images`, `luvlist_items`, `orders`, `order_items`,
`payment_attempts`, `payment_webhook_events`, `notifications`, `app_settings`,
plus the `listing-images` / `profile-images` / `verification-documents`
storage buckets and their policies.

### 4. Configure authentication providers

**Email/password** works with no extra setup.

**Google Sign-In:**
1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   create an OAuth 2.0 Client ID (type: Web application).
2. Add this Authorized redirect URI:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. In the Supabase Dashboard → Authentication → Providers → Google, paste
   the Client ID and Client Secret, then enable the provider.
4. In Supabase Dashboard → Authentication → URL Configuration, add
   `luvlots://auth/callback` to **Redirect URLs** (this is the app's deep
   link, built by `makeRedirectUri` in `lib/auth-context.tsx`).

**Facebook Login:** scaffolded in the auth layer (`signInWithOAuth('facebook')`
works once configured) but the sign-in/sign-up screens currently show it as
"Coming Soon" and don't call it. To enable: create a Meta app, add the
Facebook provider in Supabase the same way as Google, add the same
`luvlots://auth/callback` redirect, then wire the button back up in
`app/(auth)/SignUp.tsx` and `app/(auth)/Password.tsx`.

### 5. Deploy the G8 Pay (Ganap) Edge Functions

The functions in `supabase/functions/` (`g8-pay-create-checkout`,
`g8-pay-status`, `g8-pay-webhook`) are implemented against Ganap's checkout
+ webhook API (see `supabase/functions/_shared/g8pay-adapter.ts` for the
confirmed request/response shapes and known limitations — no status-lookup
endpoint, no webhook signature).

```bash
npx supabase secrets set G8PAY_MERCHANT_PROJECT_ID=<your-ganap-project-uuid> G8PAY_SECRET_KEY=<your-ganap-secret-key>
npx supabase functions deploy g8-pay-create-checkout
npx supabase functions deploy g8-pay-status
npx supabase functions deploy g8-pay-webhook --no-verify-jwt
```

`--no-verify-jwt` on the webhook is required because Ganap calls it
directly with no Supabase auth token. Then in the Ganap dashboard →
your project → Settings → **Webhook URL**, paste:

```
https://<your-project-ref>.supabase.co/functions/v1/g8-pay-webhook
```

Note: Ganap will not create a checkout at all until this Webhook URL field
is filled in — creating a checkout before that returns
`{"status":0,"message":"Webhook URL not found!"}`. Finally, set
`EXPO_PUBLIC_ENABLE_G8_PAY=true` in `.env` once the checkout QR-rendering UI
is wired up client-side (see "Known limitations" below).

Ganap issues one universal QR Ph (EMV Co Person-to-Merchant) code regardless
of which wallet app scans it, so **GCash, Maya, and QR Ph are all the same
checkout flow** client-side (`app/checkout/index.tsx`,
`components/GCashPaymentModal.tsx`) — there is no separate Maya/QR Ph
integration to configure. **There is no sandbox/test mode** — this adapter
talks to the real, live `api.ganap.net`, so scanning a rendered QR with a
funded wallet moves real money, and this integration has **no refund/payout
path** (see "G8 Pay / Ganap specifics" below). The client blocks amounts
outside Ganap's accepted ₱200–₱50,000 range before ever calling the edge
function.

### 6. Optional: error reporting / push notifications

- **Sentry**: set `EXPO_PUBLIC_SENTRY_DSN` and wire `@sentry/react-native`
  into `lib/observability.ts`. Left disabled by default.
- **Firebase Cloud Messaging**: the `notifications` table is in place; FCM
  device-token registration and send logic are not yet implemented.

---

## Project structure

```
app/
├── (auth)/          # Login, signup, onboarding, forgot password
├── (tabs)/          # Bottom tab navigator
│   ├── (store)/     # Home / live product feed
│   ├── (seller)/    # Seller storefronts (browse grid is "Coming Soon")
│   ├── (charity)/   # Charity auctions (Coming Soon) + partner application CTA
│   ├── (order)/     # Order history (Purchases is real; bidding tabs are Coming Soon)
│   ├── (cart)/      # Shopping cart (persisted via AsyncStorage)
│   └── (me)/        # Profile tab
├── (main)/          # Full-screen modal screens (product detail, Luvlist, checkout-adjacent…)
├── (profile)/       # Profile management screens
├── (seller-dashboard)/   # Seller tools (Products/Orders/Analytics, all real data)
├── (seller-registration)/# Seller onboarding (persists to seller_profiles)
└── checkout/        # Checkout & payment success

components/          # Shared UI components (incl. GCashPaymentModal)
lib/                 # Supabase client, auth/cart context, data-access helpers
supabase/            # SQL migrations + Edge Functions (G8 Pay)
assets/images/       # Local assets (logos, onboarding, payment logos, icons)
```

---

## Troubleshooting

### "Metro bundler failed" / Babel error on first run

This usually means the Expo / Metro cache is stale. Run:

```bash
npm run clean
npm run dev
```

If that doesn't help, do a full reset:

```bash
# macOS / Linux
rm -rf node_modules .expo
npm install
npm run dev

# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules, .expo
npm install
npm run dev
```

### Images not loading on device

The app uses **Unsplash** and **randomuser.me** for content images. Ensure your device or emulator has an active internet connection.

### "Unable to resolve module" error

Run `npm install` again, then `npm run dev`. If you recently pulled new commits, dependencies may have changed.

### Android emulator not detected

Make sure the emulator is fully booted before pressing `a`. You can verify with:

```bash
adb devices
```

### iOS build fails on Mac (CocoaPods)

```bash
cd ios
pod install
cd ..
npm run ios
```

---

## Testing checklist (auth, uploads, listings, Luvlist, payments)

- [ ] Sign up with email/password creates a `profiles` row (check the table
      in the Supabase Dashboard).
- [ ] Sign in with email/password, sign out, sign back in — session
      persists across app restarts.
- [ ] Google Sign-In completes and lands back in the app (test the
      cancel path too — closing the browser sheet should not crash).
- [ ] Wrong password / duplicate email show a readable inline error, not a
      silent failure.
- [ ] Uploading a listing image over 5 MB or a non-image file is rejected
      client-side with a clear message.
- [ ] `submit_listing_for_review` fails with a clear error if the listing
      has no title, no price, or no images; succeeds and flips status to
      `live` (or `pending_review` if `app_settings.require_listing_moderation`
      is `true`) once all three are present.
- [ ] Only `status = 'live'` listings are ever visible to a second,
      unauthenticated/different-user Supabase client.
- [ ] Adding/removing a listing from the Luvlist reflects immediately and
      survives a re-fetch; a signed-out user sees the "Sign in" state
      instead of an error.
- [ ] `g8-pay-create-checkout` creates a real `payment_attempts` row and
      returns a QR Ph payload for GCash, Maya, and QR Ph alike (same
      checkout flow, no per-wallet config); an order total outside
      ₱200–₱50,000 is rejected client-side before the edge function is even
      called.
- [ ] Re-sending the same webhook payload twice does not double-process
      (check `payment_webhook_events.processed_at` and that the order/listing
      only transition once).
- [ ] An unsigned/tampered webhook payload is logged with
      `signature_verified = false` and never flips a payment to `paid`.
- [ ] A buyer cannot `select`/`update` another user's `orders`,
      `payment_attempts`, or `listing_images` rows (test with two accounts).
- [ ] A seller cannot directly `UPDATE listings SET status = 'live'` from
      the client (RLS should reject it — only `submit_listing_for_review`
      can do that).
- [ ] A signed-in buyer cannot create a listing until they've completed
      seller onboarding (`ShopInfo` → `BusinessInfo`); attempting to insert
      a listing directly as a buyer is rejected by RLS.
- [ ] Completing seller onboarding actually flips `profiles.role` to
      `'seller'` and creates a `seller_profiles` row; running
      `update profiles set role = 'admin'` as a regular user fails (role
      self-elevation is blocked).
- [ ] Adding an item to cart, restarting the app, and reopening the cart
      shows the same item (cart persists via AsyncStorage).
- [ ] Selecting items in the cart and checking out with GCash creates a
      real `orders` + `order_items` row before the QR code appears, and the
      listing flips to `sold` only after the webhook confirms payment (not
      immediately on the client).
- [ ] Checking out with Cash on Delivery also creates a real order (visible
      in the seller's Orders dashboard).
- [ ] Submitting the "Become a Partner" form creates a real
      `partner_applications` row with a reference number derived from the
      row's actual id (not a timestamp).

## Production readiness status

This app went through a full conversion pass: every screen was audited,
mock data was either wired to real Supabase data or replaced with an honest
"Coming Soon" state, and dead/orphaned screens were removed. Here's where
things actually stand.

### Fully real, end-to-end

- **Auth**: email/password + Google OAuth (live-tested on device). Facebook
  is scaffolded in `lib/auth-context.tsx` but shown as "Coming Soon" in the
  UI, by request.
- **Profiles**: real Supabase data, avatar upload to a public `profile-images`
  bucket, edit name/bio — `app/(profile)/EditProfile.tsx`.
- **Listing creation ("Go Live")**: `app/(seller-dashboard)/AddProduct.tsx`
  uses a real image picker, uploads to `listing-images`, creates a real
  draft, and publishes via `submit_listing_for_review` — no more placeholder
  images or fake charity/auction toggles (those were removed; see below).
  Only users with `role = 'seller'` can create listings (RLS-enforced).
- **Home feed**: real live `listings` query (`lib/listings.ts#getLiveListings`),
  with a polished empty state per section instead of mock products. No more
  ad banners.
- **Cart → Checkout → Payment**: a real client-persisted cart
  (`lib/cart-context.tsx`) references real `listings.id`s. Checkout creates
  a real `orders` + `order_items` row set (price snapshotted server-side,
  never trusted from the client), then GCash/Maya/QR Ph payment (one shared
  QR Ph checkout flow — see "G8 Pay / Ganap specifics" below) charges the
  server-computed order total via G8 Pay (Ganap) — QR code rendered by
  `components/GCashPaymentModal.tsx`, confirmed only by the webhook (never
  the client), which marks every item in the order `sold`. Cash on Delivery
  also creates a real order.
- **Delivery / pickup addresses**: real `addresses` table
  (`app/(profile)/Addresses.tsx`, `AddAddress.tsx`, `lib/addresses.ts`), one
  default and one pickup address per user (DB-enforced). Seller
  registration's pickup address step (`ShopInfo.tsx`) reuses the buyer's
  already-saved addresses instead of forcing a duplicate entry — tapping
  "Set"/"Change" opens the same address list in a picker mode.
- **Auctions**: `AddProduct.tsx` creates real `auction`/`charity_auction`
  listings (starting bid, min increment, reserve price, duration) alongside
  `instant_buy`. Bidding (`AuctionDetailScreen`, `place_bid()` RPC),
  `BiddingScreen`, `Auction-Calendar`, and `Winnings` all read real data from
  the `bids` table; expired auctions close lazily via
  `close_expired_auctions()` the first time anyone loads the feed (no cron
  infra exists, so this is intentionally client-triggered).
- **Draft product editing**: `Products.tsx` — draft/rejected/archived
  listings are tappable and open `AddProduct.tsx` pre-filled for editing
  (including swapping/removing photos) instead of being static cards;
  listing type can't be changed after creation.
- **Seller verification**: ID/document upload (`lib/verification.ts`) goes
  to the private `verification-documents` bucket and is only ever read back
  via a signed, time-limited URL — wired to the real
  `request_verification()` RPC.
- **Seller dashboard**: `Products`, `Orders`, and `Analytics` all read real
  data (your listings, real sales via `order_items`, real revenue/top-seller
  numbers) — no fabricated stats or fake "Request Payout" button (that was
  actively misleading, since seller payouts aren't confirmed to be
  supported by Ganap — see below).
- **Seller onboarding**: `ShopInfo` → `BusinessInfo` persists to a real
  `seller_profiles` table and flips `profiles.role` to `'seller'` via the
  `become_seller()` RPC (buyer → seller only, can't self-elevate to admin).
- **Buyer order history**: `(tabs)/(order)` "Purchases" tab and
  `Purchase-History.tsx` read real orders.
- **Notifications**: real `notifications` table wired up (currently empty
  until something writes to it — no automated notification-creation is
  wired yet, e.g. on order paid/shipped; the screen and RLS are ready for
  that follow-up).
- **Luvlist**: fully real (unchanged from the prior pass).
- **Charity partner applications**: `BecomeAPartnerScreen` persists to a
  real `partner_applications` table with a real reference number, reachable
  from the Charity tab's "Apply to Become a Partner" button.
- **Seller storefront**: tapping any seller now goes to a real page
  (`(tabs)/(seller)/[id].tsx`) showing their live listings, not a mock
  celebrity profile.

### Deliberately "Coming Soon" (no real backend/infra exists yet)

These render a clean, honest empty state instead of fake data, because
building them for real requires infrastructure or partnerships beyond this
pass:

- **Celebrity sellers browse grid** (`(tabs)/(seller)/index.tsx`) — needs
  real celebrity partner relationships (the individual seller storefront
  page is real, though).
- **Charity Auctions** (`(tabs)/(charity)`, `CharityDetailScreen`) — needs
  real charity partner organizations (the application form is real).
- **Live selling / streaming** (`LiveSellingScreen`) — no streaming infra.
- **Direct messaging** (`MessagesScreen`) — no conversations/messages
  schema yet; this is a real, buildable feature (unlike the two above) but
  was descoped for time in this pass.
- **Vouchers** (`VouchersScreen`) — the old checkout discount feature was
  removed because it couldn't correctly reduce the real G8 Pay charge
  amount without misleading the buyer about what they'd actually pay.

### G8 Pay / Ganap specifics

- **No sandbox/test mode.** This adapter is confirmed live against the real
  `api.ganap.net` — there is no separate test environment, so scanning a
  rendered checkout QR with a funded wallet moves real money. Creating a
  checkout session (rendering the QR) itself is free; only actually
  scanning + approving it in a wallet app charges anything.
- **Ganap has no confirmed status-lookup endpoint and no webhook signature.**
  `getG8PayStatus` falls back to the last known DB state when polling isn't
  possible; payment confirmation only ever arrives via the webhook. Because
  the webhook is unsigned, integrity is enforced by requiring the payload's
  `externalId` (our own server-generated `payment_attempts.id`) **and**
  `referenceNumber` **and** `amount` to all match an existing, still-pending
  row — see `supabase/functions/_shared/g8pay-adapter.ts` and
  `supabase/functions/g8-pay-webhook/index.ts` for the full reasoning. An
  attacker would need to correctly guess two independent unguessable values,
  not just one.
- **Whether Ganap supports split payments / seller payouts / escrow /
  delayed capture / refunds is undocumented.** This integration is
  **buyer payment collection only** — no seller payout logic exists, and
  there is no in-app way to reverse a completed payment.

### Smaller known gaps

- No real shipping/fulfillment tracking exists (the old fake progress
  tracker was removed).
- `close_expired_auctions()` is callable by any signed-in user rather than
  only a cron job / service role, since no cron infrastructure exists in
  this project yet. Not exploitable for tampering (the outcome is fully
  determined by existing bid data), just worth tightening if/when a real
  scheduled job is set up.

### Security fixes made during this pass

- **`profiles.role` self-elevation was possible** — any signed-in user
  could have run `update profiles set role = 'admin'` on their own row. Now
  blocked by a trigger; `role` can only change via the `become_seller()`
  RPC (buyer → seller only).
- **Listing creation didn't require `role = 'seller'`** — any buyer could
  insert a listing. Now RLS-enforced.
- Cleaned up ~20 dead/orphaned screen files (duplicates and an entire
  unused `features/` component library) that had no navigation path to
  them, several still showing fake data under a real public figure's name
  and photo.
- **G8 Pay checkout/status endpoints leaked `provider_transaction_id`
  (Ganap's `referenceNumber`) to the client.** Since Ganap's webhook has no
  signature, the webhook handler's only integrity check is "referenceNumber
  + amount match an existing payment attempt" — a buyer who received their
  own referenceNumber could forge a `paid` webhook and get an order for
  free. Both endpoints now strip that field (and `provider_response`) from
  their client-facing response. **Redeploy required** after pulling this
  change: `npx supabase functions deploy g8-pay-create-checkout && npx supabase functions deploy g8-pay-status`.

**Turnover pass (this session):**

- Fixed a live bug: `submit_listing_for_review()` failed every publish
  attempt with `column reference "listing_id" is ambiguous` (SQLSTATE
  42702) — the function's own parameter name collided with a column name.
  Fixed and deployed (`20260705000023_fix_submit_listing_ambiguity.sql`).
- **G8 Pay webhook forgery hardening**: the webhook previously matched
  incoming events against `payment_attempts` using only
  `provider_transaction_id` (Ganap's reference number). It now also
  requires the row's own `id` (echoed back as `externalId`) to match, so an
  attacker needs to correctly guess two independent unguessable values
  instead of one. Deployed.
- Ran a full security pass across SQL migrations, Edge Functions, and
  client code (RLS policies, role-elevation guards, price/amount handling,
  webhook integrity, secrets, storage, deep links, injection risk). No
  other high/medium exploitable issues found — see the "G8 Pay / Ganap
  specifics" and "Smaller known gaps" sections above for the two
  low-severity items intentionally left as-is (with rationale).
- Seller registration's pickup address step now reuses saved addresses
  instead of forcing a new one every time (see "Delivery / pickup
  addresses" above).
- Draft/rejected/archived products are now editable from `Products.tsx`
  instead of being static cards (see "Draft product editing" above).
- Enabled Maya and QR Ph as full payment options (previously "Coming
  Soon") since they share the exact same QR Ph checkout flow as GCash — no
  separate integration needed.
- The GCash/Maya/QR Ph payment modal's "I've paid — check now" button now
  gives explicit feedback ("we haven't received your payment yet...")
  instead of silently resetting when a payment genuinely isn't confirmed
  yet.

**Production build hardening (this session):**

- **Fixed a silent env-var bug that shipped a broken production APK.**
  `lib/env.ts` was reading `EXPO_PUBLIC_*` variables through an indirect
  variable (`const runtimeEnv = process.env; ...runtimeEnv.EXPO_PUBLIC_X`)
  instead of the literal `process.env.EXPO_PUBLIC_X` form that Expo's build
  tooling statically inlines at build time. The indirect form silently
  evaluated to `undefined` in every compiled bundle — no build error, no
  warning — which meant the shipped app always showed "Supabase is not
  configured" regardless of what was set on EAS or in `.env`. Fixed by
  reading `process.env.EXPO_PUBLIC_X` directly in `lib/env.ts`. Verified by
  unzipping a built `.apk`'s `assets/index.android.bundle` and confirming
  the actual Supabase URL/key strings are present post-fix (they were
  absent before).
- Registered all `EXPO_PUBLIC_*` values as EAS environment variables
  (`eas env:create`, both `preview` and `production` environments) — a
  `.env` file is git-ignored by design and is never visible to EAS's cloud
  build containers, so cloud builds need these registered separately from
  local development.
- **Root-caused a Google Sign-In failure** where, after completing Google
  auth, the in-app browser showed `localhost refused to connect` instead
  of returning to the app. Cause: `luvlots://auth/callback` (the release
  build's OAuth redirect — see `lib/auth-context.tsx`) was missing from
  Supabase Dashboard → Authentication → URL Configuration → Redirect URLs,
  so Supabase fell back to its default, unconfigured Site URL
  (`localhost:3000`). Fixed by adding the redirect URL in the dashboard;
  no code change was needed. See [HANDOVER.md](HANDOVER.md) for the
  step-by-step so this doesn't get missed again on a fresh Supabase
  project.
- Verified end-to-end on a real device post-fix: email sign-up, Google
  sign-in (full round-trip back into the app), and checkout reaching the
  GCash/Maya QR screen.

---

## Ownership transfer checklist

**See [HANDOVER.md](HANDOVER.md) for the full step-by-step setup guide** —
this section is the quick-reference version.

Everything below runs on the current owner's personal Supabase, Expo/EAS,
Google Cloud, and Ganap accounts. None of this migrates automatically —
each service needs an explicit handoff or a fresh account + data copy.

**This repo's current live project** (for whoever is receiving the handoff —
ask the previous owner for actual access/credentials to these, none of the
values below are secrets):

- **Supabase project**: "Luvlots" (region `ap-southeast-1`). All 23
  migrations in `supabase/migrations/` are applied; all three `g8-pay-*`
  Edge Functions are deployed.
- **GitHub**: this repository, `production-ready` branch is the
  up-to-date, working state as of this handoff.
- **Payments**: G8 Pay/Ganap merchant project is live and configured
  (secrets already set on the Supabase project above) — see "G8 Pay /
  Ganap specifics" for what that does and doesn't cover.

**Recommended: the new owner creates their own accounts rather than
inheriting the previous owner's** — accepting org/IAM membership on
someone else's personal Supabase or Google Cloud account just means the
app keeps sitting on *their* account, revocable at their discretion, which
defeats the point of a handoff.

1. **Supabase** — new owner creates their own project and re-runs
   `supabase/migrations/` against it (schema only — this does **not** copy
   existing rows/files; use `supabase db dump --data-only` or the
   Dashboard's backup/restore for real user data and `supabase storage`
   bucket contents if there's production data worth keeping). Do **not**
   add them as a member of the previous owner's Supabase organization.
   Afterwards, the previous owner should rotate/regenerate their
   **service role key** and all Edge Function secrets — treat those as
   compromised once access changes hands.
2. **Google Cloud (OAuth)** — new owner creates their own GCP project and
   OAuth 2.0 Client ID (Prerequisites → step 4 above), then sets it in
   their own Supabase Dashboard → Authentication → Providers → Google. Do
   **not** add them as an IAM member on the previous owner's GCP project.
3. **Expo/EAS** — new owner runs `eas init` under their own Expo account
   to link the project (this changes `extra.eas.projectId` in `app.json` —
   update and commit that change). Avoid an Expo project transfer, which
   would keep builds tied to the login history of the transferring account.
4. **Ganap (G8 Pay)** — this one genuinely can't be self-served; the
   merchant account is tied to the Luvlots business entity itself. Ask
   **David or Ms. Julia (CEO of Luvlots)** for the existing merchant
   credentials, or to sponsor a new merchant application under Luvlots'
   name — then set `G8PAY_MERCHANT_PROJECT_ID` / `G8PAY_SECRET_KEY`
   (`supabase secrets set`) and the Webhook URL in the Ganap dashboard (see
   step 5 above) against the new owner's own Supabase project.
5. **Local secrets** — `.env` is gitignored and was never committed (check
   yourself with `git log --all -- .env`), so it doesn't need "removing"
   from history — just don't hand over your own `.env` file or Supabase
   service role key; give the new owner a blank `.env.example` copy and let
   them fill in their own project's values.
6. **GitHub repository** — the new owner should **clone**, not push to,
   this repository. See [HANDOVER.md](HANDOVER.md) Section 6 for exactly
   how to move to their own repo without needing write access here.

---

## Building for release (next step — APK / IPA)

This project is pre-configured for [EAS Build](https://docs.expo.dev/build/introduction/):

- `android.package` and `ios.bundleIdentifier` are already set to `com.luvlots.app`
- Install EAS CLI: `npm install -g eas-cli`
- Log in: `eas login`
- Configure: `eas build:configure`
- Build Android APK: `eas build -p android --profile preview`

See the [EAS Build docs](https://docs.expo.dev/build/introduction/) for full details.
