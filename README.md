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

## Building for release (next step — APK / IPA)

This project is pre-configured for [EAS Build](https://docs.expo.dev/build/introduction/):

- `android.package` and `ios.bundleIdentifier` are already set to `com.luvlots.app`
- Install EAS CLI: `npm install -g eas-cli`
- Log in: `eas login`
- Configure: `eas build:configure`
- Build Android APK: `eas build -p android --profile preview`

See the [EAS Build docs](https://docs.expo.dev/build/introduction/) for full details.
