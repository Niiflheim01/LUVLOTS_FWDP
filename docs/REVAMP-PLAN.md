# 🎨 LuvLots Major UI/UX Revamp Plan

> **Goal**: Revamp the onboarding process and app interface to follow Shopee/Shein-style patterns while keeping the existing LuvLots blue color scheme (`#4289AB` → `#8FBBD8` gradient). Frontend only — no backend yet.

---

## 📋 Table of Contents

1. [Color Scheme (Preserved)](#1-color-scheme-preserved)
2. [Phase 1: Unified Auth Flow (Shopee-Style)](#2-phase-1-unified-auth-flow)
3. [Phase 2: Seller Registration (Shopee-Style)](#3-phase-2-seller-registration)
4. [Phase 3: Profile & Settings Revamp](#4-phase-3-profile--settings-revamp)
5. [Phase 4: App Interface & Navigation Revamp](#5-phase-4-app-interface--navigation-revamp)
6. [File Changes Summary](#6-file-changes-summary)
7. [Implementation Order](#7-implementation-order)

---

## 1. Color Scheme (Preserved)

The founder's color scheme stays intact:
- **Primary gradient**: `#4289AB` → `#8FBBD8`
- **Accent/CTA color**: `#5998B9` (buttons, highlights)
- **Background**: The teal-blue theme (`hsl(199.4286 44.3038% 46.4706%)`)
- **Card backgrounds**: White (`#FFFFFF`)
- **Text primary**: Black on white cards, White on blue backgrounds
- **Text secondary/muted**: `#666666` on white, `rgba(255,255,255,0.5)` on blue
- **Gold accent (existing)**: `#D9AC4E` (for tab icons, star ratings)
- **Destructive/Error**: Red text for validation errors

> 💡 The revamp changes the **layout, UX patterns, and component design** — NOT the color palette.

---

## 2. Phase 1: Unified Auth Flow (Shopee-Style)

### Current Problem
- Login and Register are separate screens with separate flows
- Register has a User/Seller toggle — forces seller decision at signup
- Address is collected at registration (premature)
- Verification screen exists but flow is disjointed

### New Flow (Shopee-Inspired)

```
┌─────────────────────────────────────────────────────┐
│  Splash Screen (existing logo + branding)           │
│  → Auto-navigates to Unified Auth Screen            │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  UNIFIED AUTH SCREEN (Sign Up / Log In)             │
│  ┌───────────────────────────────────────────────┐  │
│  │         LuvLots Logo (centered)               │  │
│  │                                               │  │
│  │  📧 Email/Phone/Username                      │  │
│  │  ─────────────────────────────                │  │
│  │                                               │  │
│  │  [        Next        ]  (disabled if empty)  │  │
│  │                                               │  │
│  │  ───────── OR ─────────                       │  │
│  │                                               │  │
│  │  [ 🔵 Continue with Google   ]                │  │
│  │  [ 🔵 Continue with Facebook ]                │  │
│  │  [ 🍎 Continue with Apple    ]                │  │
│  │                                               │  │
│  │  By continuing, you agree to LuvLots'         │  │
│  │  Terms of Service and Privacy Policy          │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       ▼
           ┌───── Is Existing User? ─────┐
           │                             │
           ▼ YES                         ▼ NO
┌──────────────────┐          ┌──────────────────────┐
│  PASSWORD SCREEN │          │  SET PASSWORD SCREEN  │
│                  │          │  (Sign Up)            │
│  Welcome back,   │          │                       │
│  user@email.com  │          │  Set Your Password    │
│                  │          │                       │
│  🔒 Password     │          │  🔒 Password           │
│  ──────────      │          │  ──────────           │
│                  │          │  Must be 8-16 chars,  │
│  [  Log In  ]    │          │  1 upper, 1 lower     │
│                  │          │                       │
│  Forgot password?│          │  [  Sign Up  ]        │
└──────────────────┘          └──────────────────────┘
           │                             │
           ▼                             ▼
┌─────────────────────────────────────────────────────┐
│  → Navigate to Home (Tabs)                          │
└─────────────────────────────────────────────────────┘
```

### Key Design Decisions
1. **Single input field** on first screen — email, phone, OR username
2. **"Next" button** determines if user exists (for now, always goes to Set Password/Sign Up since no backend)
3. **No User/Seller toggle at registration** — everyone signs up the same way. Seller registration is a separate flow accessible from profile/settings
4. **No address at registration** — address management lives in Profile > Settings > My Addresses
5. **Social login buttons** styled like Shopee (outlined, with brand icons)
6. **Terms of Service** link at bottom (not a checkbox — implied by continuing)

### Screens to Create/Modify

| Screen | Action | Description |
|--------|--------|-------------|
| `app/(auth)/Login.tsx` | **REPLACE** → `app/(auth)/index.tsx` | Unified auth entry (email/phone input + social buttons) |
| `app/(auth)/Password.tsx` | **NEW** | Password entry for login (returning user) |
| `app/(auth)/SetPassword.tsx` | **NEW** | Set password for new sign up |
| `app/(auth)/Forgot.tsx` | **KEEP (Modify)** | Restyle to match new design language |
| `app/(auth)/Verification.tsx` | **REMOVE** | Not needed yet per requirements |
| `app/(auth)/Verified.tsx` | **REMOVE** | Not needed yet per requirements |
| `app/(auth)/Confirm-Password.tsx` | **KEEP (Modify)** | Restyle for password reset |
| `app/(auth)/Register.tsx` | **REMOVE** | Replaced by unified flow |
| `components/sign-in-form.tsx` | **REMOVE** | Replaced by new auth screen |
| `components/register-form.tsx` | **REMOVE** | Replaced by unified flow |
| `components/social-connections.tsx` | **MODIFY** | Restyle to Shopee-style outlined buttons |
| `features/auth/components/UserRegisterForm.tsx` | **REMOVE** | No longer needed |
| `features/auth/components/SellerRegisterForm.tsx` | **REMOVE** | Seller registration moves to separate flow |

---

## 3. Phase 2: Seller Registration (Shopee-Style)

### How Shopee Does It
In Shopee, becoming a seller is a **post-registration** process:
1. User goes to their **Profile/Me** tab
2. Taps **"Start Selling"** button (or "Seller Centre")
3. Sees a **Welcome screen** ("Welcome to LuvLots! Register as a seller...")
4. Goes through a **multi-step form**:
   - **Step 1: Shop Information** — Shop Name, Pickup Address, Email, Phone
   - **Step 2: Business Information** — ID verification, business type (optional for now)
5. After completion → seller account is activated

### New Seller Registration Flow

```
┌─────────────────────────────────────────────────────┐
│  Profile Screen → "Start Selling" Button            │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  WELCOME SCREEN                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │         [Illustration/Image]                  │  │
│  │                                               │  │
│  │  Welcome to LuvLots!                          │  │
│  │                                               │  │
│  │  To get started, register as a seller         │  │
│  │  by providing the necessary information.      │  │
│  │                                               │  │
│  │                                               │  │
│  │  [ Start Registration ]  (full-width CTA)     │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  SHOP INFORMATION (Step 1 of 2)                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  ○ Shop Info ──────── ○ Business Info         │  │
│  │  (progress stepper)                           │  │
│  │                                               │  │
│  │  Shop Name *                    10/30         │  │
│  │  ──────────────────────────                   │  │
│  │                                               │  │
│  │  Pickup Address *               Set >         │  │
│  │  ──────────────────────────                   │  │
│  │                                               │  │
│  │  Email *                  user@email... >      │  │
│  │  ──────────────────────────                   │  │
│  │                                               │  │
│  │  Phone Number *                 Set >         │  │
│  │  ──────────────────────────                   │  │
│  │                                               │  │
│  │  [  Back  ] [  Next  ]                        │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  BUSINESS INFORMATION (Step 2 of 2)                 │
│  ┌───────────────────────────────────────────────┐  │
│  │  ● Shop Info ──────── ○ Business Info         │  │
│  │                                               │  │
│  │  Business Type                                │  │
│  │  [ Individual ] [ Business ]                  │  │
│  │                                               │  │
│  │  Government ID (optional)                     │  │
│  │  [ Upload ID ]                                │  │
│  │                                               │  │
│  │  [  Back  ] [  Submit  ]                      │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│  SUCCESS SCREEN                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │         ✅ (checkmark icon)                   │  │
│  │                                               │  │
│  │  You're now a seller!                         │  │
│  │                                               │  │
│  │  Start listing your items and reach           │  │
│  │  millions of buyers on LuvLots.               │  │
│  │                                               │  │
│  │  [  Go to Seller Dashboard  ]                 │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Screens to Create

| Screen | Description |
|--------|-------------|
| `app/(seller-registration)/_layout.tsx` | Stack layout for seller onboarding |
| `app/(seller-registration)/Welcome.tsx` | Welcome/intro screen with "Start Registration" CTA |
| `app/(seller-registration)/ShopInfo.tsx` | Step 1: Shop name, address, email, phone |
| `app/(seller-registration)/BusinessInfo.tsx` | Step 2: Business type, optional ID upload |
| `app/(seller-registration)/Success.tsx` | Registration complete confirmation |
| `features/seller/components/SellerRegistrationStepper.tsx` | Progress stepper component (Step 1/2 indicator) |

---

## 4. Phase 3: Profile & Settings Revamp

### Current Problem
- Profile screen is basic with nav cards
- No settings section
- No address management
- No "Start Selling" option

### New Profile Structure (Shopee-Inspired)

```
┌─────────────────────────────────────────────────────┐
│  PROFILE SCREEN (from Tab)                          │
│  ┌───────────────────────────────────────────────┐  │
│  │  [Avatar]  User Name                          │  │
│  │            Edit Profile >                     │  │
│  │                                               │  │
│  │  ─────────────────────────────                │  │
│  │                                               │  │
│  │  📦 Purchase History                      >   │  │
│  │  📅 Auction Calendar                      >   │  │
│  │  🏆 My Winnings                           >   │  │
│  │  🔔 Notifications                         >   │  │
│  │  💬 Messages                              >   │  │
│  │                                               │  │
│  │  ─────────────────────────────                │  │
│  │                                               │  │
│  │  🛍️ Start Selling                         >   │  │
│  │                                               │  │
│  │  ─────────────────────────────                │  │
│  │                                               │  │
│  │  ⚙️ Account Settings                      >   │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Account Settings Screen (Shopee-Inspired)

```
┌─────────────────────────────────────────────────────┐
│  ACCOUNT SETTINGS                                   │
│  ┌───────────────────────────────────────────────┐  │
│  │  My Account                                   │  │
│  │  ──────────                                   │  │
│  │  Account & Security                       >   │  │
│  │  My Addresses                             >   │  │
│  │  Bank Accounts / Cards                    >   │  │
│  │                                               │  │
│  │  Settings                                     │  │
│  │  ──────────                                   │  │
│  │  Notification Settings                    >   │  │
│  │  Privacy Settings                         >   │  │
│  │  Language                                 >   │  │
│  │                                               │  │
│  │  Support                                      │  │
│  │  ──────────                                   │  │
│  │  Help Centre                              >   │  │
│  │  About                                    >   │  │
│  │                                               │  │
│  │  [ Log Out ]                                  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### My Addresses Screen (Shopee-Inspired)

```
┌─────────────────────────────────────────────────────┐
│  MY ADDRESSES                                       │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │         [Map pin illustration]                │  │
│  │  You don't have addresses yet                 │  │
│  │                                               │  │
│  │  ─── OR if addresses exist ───                │  │
│  │                                               │  │
│  │  📍 Home (default)                            │  │
│  │  John Doe | (+63) 912 345 6789               │  │
│  │  123 Main St, Makati City, Metro Manila      │  │
│  │  [Edit] [Delete]                              │  │
│  │                                               │  │
│  │  📍 Work                                      │  │
│  │  John Doe | (+63) 912 345 6789               │  │
│  │  456 Office Bldg, BGC, Taguig                │  │
│  │  [Edit] [Delete]                              │  │
│  │                                               │  │
│  │  [ + Add a new address ]  (outlined button)   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### New Address Form (Shopee-Inspired)

```
┌─────────────────────────────────────────────────────┐
│  NEW ADDRESS                                        │
│  ┌───────────────────────────────────────────────┐  │
│  │  Address                                      │  │
│  │  ──────────                                   │  │
│  │  Full Name                                    │  │
│  │  ──────────────────────────                   │  │
│  │  Phone Number                                 │  │
│  │  ──────────────────────────                   │  │
│  │  Region, Province, City, Barangay         >   │  │
│  │  ──────────────────────────                   │  │
│  │  Postal Code                                  │  │
│  │  ──────────────────────────                   │  │
│  │  Street Name, Building, House No.             │  │
│  │  ──────────────────────────                   │  │
│  │                                               │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │ Set as Default Address        [toggle]  │  │  │
│  │  │ Set as Pickup Address         [toggle]  │  │  │
│  │  │ Label As:  [Work] [Home]               │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │                                               │  │
│  │  [          Submit          ]                 │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Region Picker (Shopee-Inspired)

```
┌─────────────────────────────────────────────────────┐
│  SELECT YOUR REGION                                 │
│  ┌───────────────────────────────────────────────┐  │
│  │  [ 📍 Use My Current Location ]               │  │
│  │                                               │  │
│  │  Region                                       │  │
│  │  ──────────                                   │  │
│  │  M  Metro Manila                              │  │
│  │     ─────────────                             │  │
│  │     Mindanao                                  │  │
│  │     ─────────────                             │  │
│  │  N  North Luzon                               │  │
│  │     ─────────────                             │  │
│  │  S  South Luzon                               │  │
│  │     ─────────────                             │  │
│  │  V  Visayas                                   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Screens to Create/Modify

| Screen | Action | Description |
|--------|--------|-------------|
| `app/(profile)/Profile.tsx` | **MODIFY** | Add "Start Selling" button, "Account Settings" link, restructure layout |
| `app/(profile)/Settings.tsx` | **NEW** | Account Settings screen (Shopee-style sections) |
| `app/(profile)/Addresses.tsx` | **NEW** | Address list with add/edit/delete |
| `app/(profile)/AddAddress.tsx` | **NEW** | New address form |
| `app/(profile)/EditAddress.tsx` | **NEW** | Edit existing address form |
| `app/(profile)/RegionPicker.tsx` | **NEW** | Region/Province/City/Barangay drill-down picker |
| `app/(profile)/EditProfile.tsx` | **NEW** | Edit user profile (name, email, phone, avatar) |
| `features/profile/components/SettingsSection.tsx` | **NEW** | Reusable settings section group |
| `features/profile/components/SettingsRow.tsx` | **NEW** | Reusable settings row (label + value + chevron) |
| `features/profile/components/AddressCard.tsx` | **NEW** | Address display card |

---

## 5. Phase 4: App Interface & Navigation Revamp

### Tab Bar Changes
Keep the existing floating tab bar concept but add a **Profile tab** (Shopee has: Home, Mall, Live, Notifications, Me).

**New Tab Structure:**
| Tab | Icon | Screen |
|-----|------|--------|
| Home/Store | 🏠 `Home` | Browse/shop/auction listings |
| Sellers | ⭐ `Star` | Celebrity & influencer sellers |
| Cart | 🛒 `ShoppingCart` | Shopping cart |
| Orders | 📋 `ClipboardCheck` | My orders/bids |
| Me | 👤 `User` | Profile & settings |

> **Remove** the Charity tab from the main tab bar (move it into the Home screen as a section/banner instead).

### Home Screen Enhancement
The current store screen is good but needs polish:
- Add a **banner/carousel** area at the top (like Shopee's promotional banners)
- Add **quick-action icons** row (Live Now, Charity, Categories, Flash Deals)
- Keep auction items grid

### Seller Profile (Shopee-Inspired)
When viewing a seller, show their **Shop Profile** similar to Shopee:
- Shop logo, name, description
- Follower count, rating
- Product grid
- "Follow" button

---

## 6. File Changes Summary

### Files to DELETE
```
components/sign-in-form.tsx
components/register-form.tsx
features/auth/components/UserRegisterForm.tsx
features/auth/components/SellerRegisterForm.tsx
app/(auth)/Login.tsx
app/(auth)/Register.tsx
app/(auth)/Verification.tsx
app/(auth)/Verified.tsx
```

### Files to CREATE
```
# Auth (Unified Shopee-style)
app/(auth)/index.tsx                          # Unified auth entry screen
app/(auth)/Password.tsx                        # Login password screen
app/(auth)/SetPassword.tsx                     # Sign up set password screen

# Seller Registration (Shopee-style)
app/(seller-registration)/_layout.tsx          # Stack layout
app/(seller-registration)/Welcome.tsx          # Welcome/intro
app/(seller-registration)/ShopInfo.tsx         # Step 1: Shop details
app/(seller-registration)/BusinessInfo.tsx     # Step 2: Business details
app/(seller-registration)/Success.tsx          # Completion screen

# Profile & Settings (Shopee-style)
app/(profile)/Settings.tsx                     # Account settings
app/(profile)/Addresses.tsx                    # Address list
app/(profile)/AddAddress.tsx                   # Add new address form
app/(profile)/EditAddress.tsx                  # Edit address form
app/(profile)/RegionPicker.tsx                 # Region drill-down picker
app/(profile)/EditProfile.tsx                  # Edit profile screen

# Shared Components
components/social-connections-new.tsx           # Shopee-style outlined social buttons
features/seller/components/SellerRegistrationStepper.tsx
features/profile/components/SettingsSection.tsx
features/profile/components/SettingsRow.tsx
features/profile/components/AddressCard.tsx
```

### Files to MODIFY
```
app/_layout.tsx                     # Add seller-registration route
app/index.tsx                       # Redirect to new auth entry
app/(auth)/_layout.tsx              # Update screen registrations
app/(auth)/Forgot.tsx               # Restyle
app/(auth)/Confirm-Password.tsx     # Restyle
app/(tabs)/_layout.tsx              # Add Profile/Me tab, reorganize
app/(profile)/Profile.tsx           # Major restructure
components/TabBar.tsx               # Minor styling tweaks
components/social-connections.tsx   # Restyle to outlined Shopee buttons
global.css                          # Keep as-is (color scheme preserved)
```

---

## 7. Implementation Order

### Sprint 1: Auth Revamp (Core Priority) 🔴
1. ✏️ Create new unified auth entry screen (`app/(auth)/index.tsx`)
2. ✏️ Create Password screen (login flow)
3. ✏️ Create SetPassword screen (signup flow)
4. ✏️ Restyle social connections to Shopee-style
5. ✏️ Update auth layout to register new screens
6. ✏️ Restyle Forgot Password flow
7. 🗑️ Remove old Login, Register, Verification, Verified screens
8. 🗑️ Remove old form components

### Sprint 2: Profile & Settings 🟡
9. ✏️ Restructure Profile screen (add Start Selling, Account Settings)
10. ✏️ Create Account Settings screen
11. ✏️ Create My Addresses screen (empty state + list)
12. ✏️ Create Add/Edit Address form
13. ✏️ Create Region Picker
14. ✏️ Create Edit Profile screen

### Sprint 3: Seller Registration Flow 🟢
15. ✏️ Create seller registration layout
16. ✏️ Create Welcome screen
17. ✏️ Create Shop Information form (with stepper)
18. ✏️ Create Business Information form
19. ✏️ Create Success screen
20. ✏️ Wire "Start Selling" button from Profile

### Sprint 4: Navigation & Polish 🔵
21. ✏️ Add Profile/Me tab to tab bar
22. ✏️ Move Charity out of tabs (into Home as section)
23. ✏️ Polish Home screen layout
24. ✏️ Ensure consistent styling across all screens
25. ✏️ Test full flow end-to-end

---

## Design Principles (Shopee/Shein Reference)

1. **Clean white cards on colored backgrounds** — content sits in white rounded cards
2. **Minimal input fields** — one field per screen when possible (Shopee auth is single-field)
3. **Clear CTAs** — full-width buttons at bottom, disabled state when invalid
4. **Section headers** — gray background, small caps text (like "My Account", "Settings", "Support")
5. **Chevron indicators** — `>` on the right side of tappable rows
6. **Progress indicators** — stepper dots/lines for multi-step flows
7. **Outlined social buttons** — white background with brand icon + text (not filled)
8. **Validation inline** — red text below fields (like "Please provide Full Name")
9. **Toggle switches** — for boolean settings (Shopee green-style)
10. **Bottom-anchored actions** — primary buttons stick to the bottom of the screen

---

## Notes
- **No backend integration yet** — all forms accept any input, navigation is immediate
- **No verification code** — removed per requirements (accept any input)
- **Seller registration is separate** from user signup (matches Shopee pattern)
- **Address management lives in Profile > Settings > My Addresses** (not at signup)
- **Color scheme is untouched** — only layout/UX patterns change
