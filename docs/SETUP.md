# LuvLots - Setup Guide

This guide will help you set up the LuvLots application after cloning it from GitHub.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Platform-Specific Setup](#platform-specific-setup)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (v18 or higher recommended)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js) or **yarn** or **pnpm**
   - Verify installation: `npm --version`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

### Platform-Specific Requirements

#### For iOS Development (macOS only)
- **macOS** (Ventura or later recommended)
- **Xcode** (14.0 or higher)
  - Install from Mac App Store
  - Install Xcode Command Line Tools: `xcode-select --install`
- **CocoaPods**: `sudo gem install cocoapods`
- **iOS Simulator** (included with Xcode)

#### For Android Development
- **Android Studio** (latest stable version)
  - Download from [developer.android.com/studio](https://developer.android.com/studio)
- **Android SDK** (API level 33 or higher)
- **Android Emulator** or a physical Android device
- **Java Development Kit (JDK)** 17 or higher

#### For Web Development
- Any modern web browser (Chrome, Firefox, Safari, Edge)

---

## Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd luvlots
```

### Step 2: Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

Or using pnpm:
```bash
pnpm install
```

This will install all required dependencies including:
- React Native 0.79.6
- Expo SDK ~53
- NativeWind for Tailwind CSS styling
- Expo Router for navigation
- React Native Reanimated
- And all other project dependencies

### Step 3: Verify Installation

Check that all dependencies are installed correctly:
```bash
npm list --depth=0
```

---

## Running the Application

### Development Server

Start the Expo development server:

```bash
npm run dev
```

This command starts the Expo Dev Server with cache cleared. You'll see a QR code and several options to run the app.

### Platform-Specific Run Commands

#### iOS (macOS only)
```bash
npm run ios
```
This will start the development server and launch the iOS simulator.

#### Android
```bash
npm run android
```
This will start the development server and launch the Android emulator.

#### Web
```bash
npm run web
```
This will start the development server and open the app in your default web browser.

### Using Expo Go

For quick testing on physical devices:

1. Install **Expo Go** from:
   - iOS: App Store
   - Android: Google Play Store

2. Start the dev server: `npm run dev`

3. Scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

---

## Platform-Specific Setup

### iOS Setup (macOS only)

1. **Install Xcode:**
   - Download and install Xcode from the Mac App Store
   - Open Xcode and accept the license agreement
   - Install Xcode Command Line Tools:
     ```bash
     xcode-select --install
     ```

2. **Install iOS Simulator:**
   - Open Xcode → Preferences → Components
   - Download your desired iOS simulator version

3. **First-time iOS build:**
   ```bash
   npm run ios
   ```

### Android Setup

1. **Install Android Studio:**
   - Download from [developer.android.com/studio](https://developer.android.com/studio)
   - Run the installer and follow the setup wizard

2. **Configure Android SDK:**
   - Open Android Studio
   - Go to Settings → Appearance & Behavior → System Settings → Android SDK
   - Install the following:
     - Android SDK Platform 33 (or higher)
     - Android SDK Build-Tools
     - Android Emulator
     - Android SDK Platform-Tools

3. **Set up Environment Variables:**

   Add to your `~/.zshrc` or `~/.bash_profile`:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

   Then reload your shell:
   ```bash
   source ~/.zshrc  # or source ~/.bash_profile
   ```

4. **Create an Android Virtual Device (AVD):**
   - Open Android Studio
   - Go to Tools → Device Manager
   - Create a new virtual device (Pixel 5 or similar recommended)
   - Select a system image (API 33 or higher)

5. **First-time Android build:**
   ```bash
   npm run android
   ```

### Web Setup

No additional setup required. Simply run:
```bash
npm run web
```

---

## Project Structure

```
luvlots/
├── app/                          # Expo Router screens and layouts
│   ├── (auth)/                   # Authentication screens
│   ├── (main)/                   # Main app screens
│   ├── (profile)/                # Profile-related screens
│   ├── (tabs)/                   # Tab navigation screens
│   ├── checkout/                 # Checkout flow
│   ├── donation/                 # Donation screens
│   ├── live/                     # Live features
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry screen
├── assets/                       # Images, fonts, and other assets
├── components/                   # Reusable UI components
│   └── ui/                       # Base UI primitives
├── features/                     # Feature-specific components
│   ├── auth/                     # Auth feature components
│   ├── cart/                     # Cart feature components
│   ├── checkout/                 # Checkout feature components
│   ├── order/                    # Order feature components
│   └── seller/                   # Seller feature components
├── lib/                          # Utility functions and configurations
│   ├── theme.ts                  # Theme configuration
│   └── utils.ts                  # Utility functions
├── docs/                         # Documentation
├── app.json                      # Expo configuration
├── babel.config.js               # Babel configuration
├── global.css                    # Global CSS and Tailwind theme tokens
├── metro.config.js               # Metro bundler configuration
├── package.json                  # Dependencies and scripts
├── tailwind.config.js            # Tailwind CSS configuration
└── tsconfig.json                 # TypeScript configuration
```

### Key Technologies

- **React Native 0.79.6** - Mobile application framework
- **Expo SDK ~53** - Development platform and tools
- **Expo Router 5.x** - File-based navigation
- **NativeWind 4.x** - Tailwind CSS for React Native
- **TypeScript** - Type-safe development
- **React Native Reanimated** - Animations
- **Lucide React Native** - Icon library

---

## Troubleshooting

### Common Issues

#### 1. Metro Bundler Cache Issues

If you encounter unexpected behavior, clear the cache:
```bash
npm run clean
npm install
npm run dev
```

#### 2. iOS Build Errors

**Error: "Command PhaseScriptExecution failed"**
```bash
cd ios
pod install
cd ..
npm run ios
```

**Error: "Unable to boot simulator"**
- Open Xcode → Window → Devices and Simulators
- Delete and recreate the simulator

#### 3. Android Build Errors

**Error: "SDK location not found"**
- Ensure `ANDROID_HOME` is set correctly
- Verify Android SDK is installed

**Error: "Emulator not found"**
```bash
# List available emulators
emulator -list-avds

# Start emulator manually
emulator -avd <emulator-name>
```

#### 4. Dependency Issues

**Error: "Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Error: Resolution conflicts**
- Check `resolutions` field in `package.json`
- Ensure compatible versions

#### 5. NativeWind/Tailwind Issues

**Styles not applying:**
- Restart the Metro bundler
- Clear cache: `npm run dev` (already includes `-c` flag)
- Check `global.css` is imported in root layout

#### 6. Port Already in Use

If port 8081 is occupied:
```bash
# Find process using port 8081
lsof -i :8081

# Kill the process
kill -9 <PID>

# Or use a different port
npx expo start --port 8082
```

### Getting Help

If you encounter issues not covered here:

1. Check the [Expo Documentation](https://docs.expo.dev/)
2. Review [React Native Documentation](https://reactnative.dev/)
3. Search [GitHub Issues](https://github.com/expo/expo/issues)
4. Visit [Expo Forums](https://forums.expo.dev/)

---

## Additional Resources

### Documentation

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [React Native Reusables](https://reactnativereusables.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Development Tools

- [Expo DevTools](https://docs.expo.dev/workflow/debugging/)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/) - Desktop debugging platform

### Useful Commands

```bash
# Clear cache and restart
npm run dev

# Clean build artifacts
npm run clean

# Run on specific platform
npm run ios
npm run android
npm run web

# Install additional components
npx react-native-reusables/cli@latest add [component-name]

# Check for outdated dependencies
npm outdated

# Update dependencies
npm update
```

---

## Environment Configuration

This project uses environment-based configuration. To set up:

1. Create environment files as needed (e.g., `.env`, `.env.local`)
2. Add them to `.gitignore` (if not already)
3. Configure variables for API endpoints, keys, etc.

**Note:** Check with your team for any required environment variables specific to your deployment.

---

## Next Steps

After successful setup:

1. ✅ Explore the project structure
2. ✅ Review existing components in `components/` and `components/ui/`
3. ✅ Check screen implementations in `app/`
4. ✅ Understand the navigation flow (Expo Router)
5. ✅ Review theme configuration in `lib/theme.ts` and `global.css`
6. ✅ Familiarize yourself with the coding conventions
7. ✅ Set up your development environment preferences

---

## Support

For project-specific questions or issues, please contact the development team or refer to the project's internal documentation.

**Happy coding! 🚀**
