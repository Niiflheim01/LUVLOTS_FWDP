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
│   ├── (store)/     # Home / product feed
│   ├── (seller)/    # Celebrity & influencer sellers
│   ├── (charity)/   # Charity auctions & impact
│   ├── (order)/     # Order tracking
│   ├── (cart)/      # Shopping cart
│   └── (me)/        # Profile tab
├── (main)/          # Full-screen modal screens (product detail, messages, wishlist…)
├── (profile)/       # Profile management screens
├── (seller-dashboard)/   # Seller tools
├── (seller-registration)/# Seller onboarding
├── checkout/        # Checkout & payment success
└── donation/        # Donation flow

components/          # Shared UI components
features/            # Feature-scoped components and data
lib/                 # Theme tokens, utility functions
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
- [ ] `g8-pay-create-checkout` returns HTTP 501 with a clear message until
      the adapter is implemented (expected, not a bug) — once implemented,
      confirm it creates a `payment_attempts` row before returning a
      checkout URL.
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

## Known limitations / not yet production-ready

Being explicit about what still uses mock data or is left as a clearly
marked integration point, per the conversion brief:

- **Home feed, category/designer/sustainable-brand pages, seller
  storefronts, cart, and `ProductScreen`** still render local mock arrays,
  not the real `listings` table. The backend (schema, RLS, `lib/listings.ts`)
  is ready for this; wiring each screen is a follow-up pass.
- **The "Go Live" listing creation screen** (`app/(seller-dashboard)/AddProduct.tsx`)
  is still a UI-only mock — it isn't yet calling `createListingDraft` /
  `uploadListingImage` / `submitListingForReview` from `lib/listings.ts`.
- **The Luvlist heart toggle inside `ProductScreen`** is not wired to
  `addToLuvlist`/`removeFromLuvlist` yet, because most products it's shown
  on come from the mock arrays above (no real `listing_id` to attach to).
  The new `app/(main)/LuvlistScreen.tsx` *is* fully wired to Supabase.
- **G8 Pay (Ganap) integration is implemented end-to-end for GCash**
  (`supabase/functions/g8-pay-*`, live-tested against `api.ganap.net`).
  Ganap's checkout returns an EMV "QR Ph" payload string, not a URL —
  `components/GCashPaymentModal.tsx` renders it as a real QR code and polls
  `g8-pay-status` every 4s until the webhook confirms payment. Wired into
  `app/checkout/index.tsx` for the GCash option only (Maya/QR Ph/COD are
  still the old mock flow, by request).
  **However**, `checkout/index.tsx` still runs entirely on `MOCK_ORDER`
  (mock cart data, no real `listings` row behind it), so `MOCK_ORDER.listingId`
  is empty by default and the modal will show a clear "no real listing
  linked" message instead of charging anything. To test the real flow:
  create a Supabase Auth user + a `listings` row for yourself in the
  Supabase Dashboard's SQL Editor (your own authenticated session — do not
  do this via a public endpoint), e.g.:
  ```sql
  -- Run as yourself in the Supabase Dashboard SQL Editor.
  -- Find your own user id first: select id, email from auth.users;
  insert into public.listings (seller_id, title, price, currency, listing_type, status, cover_image_url)
  values ('<your-own-user-id>', 'Test Item', 12000, 'PHP', 'instant_buy', 'live',
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80')
  returning id;
  ```
  then paste the returned `id` into `MOCK_ORDER.listingId` in
  `app/checkout/index.tsx`.
- **Ganap has no confirmed status-lookup endpoint and no webhook signature.**
  `getG8PayStatus` falls back to the last known DB state when polling isn't
  possible; payment confirmation only ever arrives via the webhook. Because
  the webhook is unsigned, integrity is enforced by matching the payload's
  externalId + amount against an existing, still-pending `payment_attempts`
  row keyed by an unguessable server-generated UUID — see the comments in
  `supabase/functions/_shared/g8pay-adapter.ts` for the full reasoning and
  residual risk.
- **Whether Ganap supports split payments / seller payouts / escrow /
  delayed capture / refunds is undocumented.** Treat this integration as
  **buyer payment collection only** — do not build seller payout logic on
  top of it until Ganap confirms support.
- **Facebook Login** is scaffolded in `lib/auth-context.tsx`
  (`signInWithOAuth('facebook')`) but the UI shows it as "Coming Soon" and
  doesn't call it, by request.
- **Firebase Cloud Messaging and Sentry** are deferred. The `notifications`
  table and `lib/observability.ts` integration points exist, but no FCM
  device registration or Sentry SDK wiring has been added yet.

---

## Building for release (next step — APK / IPA)

This project is pre-configured for [EAS Build](https://docs.expo.dev/build/introduction/):

- `android.package` and `ios.bundleIdentifier` are already set to `com.luvlots.app`
- Install EAS CLI: `npm install -g eas-cli`
- Log in: `eas login`
- Configure: `eas build:configure`
- Build Android APK: `eas build -p android --profile preview`

See the [EAS Build docs](https://docs.expo.dev/build/introduction/) for full details.
