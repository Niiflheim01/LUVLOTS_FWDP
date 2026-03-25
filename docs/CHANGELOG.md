# Changelog

All notable changes to the **LuvLots** project will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.2.0] — 2025-07-09

### 🎨 Major UI/UX Revamp — Shopee-Inspired Redesign

Complete visual overhaul of the app following Shopee's UX patterns while preserving LuvLots' brand color scheme (`#4289AB` → `#8FBBD8` gradient).

### Added

#### Auth Flow (Unified Login/Signup)
- **`app/(auth)/index.tsx`** — Unified auth entry screen with single email/phone/username input, social login buttons (Google, Facebook, Apple), and Terms of Service link.
- **`app/(auth)/Password.tsx`** — Login password screen for returning users with show/hide toggle and "Forgot Password" link.
- **`app/(auth)/SetPassword.tsx`** — Sign-up set password screen with real-time requirement validation (8–16 chars, uppercase, lowercase) and green-dot indicators.

#### Profile & Settings Section
- **`app/(profile)/_layout.tsx`** — New Stack layout registering all profile sub-screens with consistent gradient headers and white back arrow.
- **`app/(profile)/Profile.tsx`** — Complete rewrite: avatar, sectioned menu (Activity, Seller, General), "Start Selling" button, and Account Settings link.
- **`app/(profile)/Settings.tsx`** — Shopee-style account settings with grouped sections (My Account, Settings, Support) and log-out confirmation.
- **`app/(profile)/EditProfile.tsx`** — Edit profile screen: photo, name, bio (0/500), masked phone/email, "Update followers" toggle.
- **`app/(profile)/Addresses.tsx`** — Address list with empty state, edit/delete actions, Default/Pickup/Label badges.
- **`app/(profile)/AddAddress.tsx`** — Full address form: name, phone, region picker link, postal code, street, default/pickup toggles, label selector (Work/Home), inline validation.
- **`app/(profile)/RegionPicker.tsx`** — Philippine region picker with "Use My Current Location" and grouped region list.

#### Seller Registration Flow
- **`app/(seller-registration)/_layout.tsx`** — Stack navigator for seller registration screens.
- **`app/(seller-registration)/Welcome.tsx`** — Intro screen with feature highlights and "Start Registration" CTA.
- **`app/(seller-registration)/ShopInfo.tsx`** — Step 1: Shop Name (with char counter), Pickup Address, Email, Phone, progress stepper.
- **`app/(seller-registration)/BusinessInfo.tsx`** — Step 2: Business Type selector (Individual/Business), optional Government ID upload area.
- **`app/(seller-registration)/Success.tsx`** — Completion screen with "Go to Seller Dashboard" routing.

#### Documentation
- **`docs/REVAMP-PLAN.md`** — Comprehensive revamp plan with ASCII wireframes, file change lists, and 4-phase implementation order.
- **`CHANGELOG.md`** — This file; structured changelog for EOD reporting.

### Changed

#### Auth Screens
- **`app/(auth)/_layout.tsx`** — Replaced layout; registers new screens (index, Password, SetPassword, Forgot, Confirm-Password) with transparent headers and white text.
- **`app/(auth)/Forgot.tsx`** — Restyled with `LinearGradient` background, Mail icon, and consistent card layout.
- **`app/(auth)/Confirm-Password.tsx`** — Restyled with gradient, show/hide toggles, password match validation.

#### Navigation & Layout
- **`app/_layout.tsx`** — Added `(profile)` and `(seller-registration)` Stack.Screen entries to root layout.
- **`app/index.tsx`** — Redirect changed from `/(auth)/Login` to `/(auth)`.
- **`app/(tabs)/_layout.tsx`** — Tab icons updated to Home/Star/ShoppingCart/ClipboardCheck/User. Charity tab hidden via `href: null`.
- **`components/TabBar.tsx`** — Active color set to gold `#D9AC4E`, inactive to `rgba(255,255,255,0.5)`. Added `href === null` check to skip hidden tabs.

#### Profile Sub-Screens (Gradient Restyle)
- **`app/(profile)/Purchase-History.tsx`** — Restyled with gradient background, white cards with date groups, empty state.
- **`app/(profile)/Auction-Calendar.tsx`** — Restyled with gradient, themed calendar card (Poppins fonts, brand colors), white auction list cards.
- **`app/(profile)/Winnings.tsx`** — Restyled with gradient background, white date-grouped cards, trophy empty state.
- **`app/(profile)/Notifications.tsx`** — Full restyle: gradient background, pill-shaped filter tabs, white notification cards with colored icons and gold unread dots.

### Removed
- **`app/(auth)/Login.tsx`** — Replaced by unified `index.tsx`.
- **`app/(auth)/Register.tsx`** — Replaced by unified `index.tsx` + `SetPassword.tsx`.
- **`app/(auth)/Verification.tsx`** — Removed per requirement (no verification code yet).
- **`app/(auth)/Verified.tsx`** — Removed per requirement.
- **`components/sign-in-form.tsx`** — Logic merged into `app/(auth)/index.tsx`.
- **`components/register-form.tsx`** — Logic merged into `app/(auth)/SetPassword.tsx`.
- **`components/social-connections.tsx`** — Social buttons inlined in `app/(auth)/index.tsx`.
- **`features/auth/components/UserRegisterForm.tsx`** — No longer needed.
- **`features/auth/components/SellerRegisterForm.tsx`** — Replaced by `app/(seller-registration)/*` flow.

### SDK & Dependencies
- Verified **Expo SDK 54.0.23** is current — all dependencies up to date (`npx expo install --check` confirmed).

---

## [0.1.0] — Initial Release

- Initial app structure with Expo Router, NativeWind, and file-based navigation.
- Basic auth screens (Login, Register, Verification, Verified).
- Tab-based navigation with Home, Charity, Cart, Orders, Seller sections.
- Profile, Notifications, Purchase History, Auction Calendar, and Winnings screens.
- Product bidding, cart, checkout, and donation flows (UI only).
