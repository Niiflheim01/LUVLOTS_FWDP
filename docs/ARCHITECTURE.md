# LuvLots - Architecture & Development Guide

This document provides an overview of the application architecture, coding conventions, and development guidelines.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Routing & Navigation](#routing--navigation)
- [Styling Conventions](#styling-conventions)
- [Component Structure](#component-structure)
- [State Management](#state-management)
- [Development Guidelines](#development-guidelines)
- [Best Practices](#best-practices)

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.79.6 | Mobile framework |
| React | 19.0.0 | UI library |
| Expo | ~53.0.25 | Development platform |
| TypeScript | ~5.8.3 | Type safety |

### Key Libraries

| Library | Purpose |
|---------|---------|
| Expo Router (~5.1.10) | File-based routing and navigation |
| NativeWind (^4.1.23) | Tailwind CSS for React Native |
| React Native Reanimated (~3.17.5) | Animations |
| Lucide React Native (^0.511.0) | Icon library |
| Class Variance Authority (^0.7.0) | Component variants |
| React Native Modal (^14.0.0-rc.1) | Modal components |
| React Native Calendars (^1.1313.0) | Calendar functionality |

---

## Application Architecture

### Entry Point

The application uses **Expo Router** with file-based routing. The entry point is defined in `package.json`:

```json
{
  "main": "expo-router/entry"
}
```

### Root Layout

The root layout is defined in `app/_layout.tsx` and handles:
- Font loading (Poppins font family)
- Splash screen management
- Navigation theme configuration
- Light theme enforcement

### Project Structure

```
app/
├── _layout.tsx              # Root layout with theme and fonts
├── index.tsx                # Entry/home screen
├── (auth)/                  # Authentication flow
│   ├── _layout.tsx          # Auth stack layout
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Forgot.tsx
│   ├── Confirm-Password.tsx
│   ├── Verification.tsx
│   └── Verified.tsx
├── (main)/                  # Main app screens
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── BiddingScreen.tsx
│   ├── CartDetailsScreen.tsx
│   ├── CharityScreen.tsx
│   └── CheckoutScreen.tsx
├── (profile)/               # Profile-related screens
│   ├── Profile.tsx
│   ├── Notifications.tsx
│   ├── Purchase-History.tsx
│   ├── Winnings.tsx
│   └── Auction-Calendar.tsx
├── (tabs)/                  # Bottom tab navigation
│   ├── _layout.tsx          # Tab navigator config
│   ├── (store)/
│   ├── (cart)/
│   ├── (charity)/
│   ├── (order)/
│   └── (seller)/
├── checkout/                # Checkout flow
└── donation/                # Donation screens
```

---

## Routing & Navigation

### Expo Router Structure

The app uses **Expo Router** for file-based navigation. Route groups are denoted by parentheses `()`.

#### Route Groups

- **(auth)** - Authentication screens (login, register, etc.)
- **(main)** - Main application screens
- **(profile)** - User profile and settings
- **(tabs)** - Bottom tab navigation screens

#### Navigation Patterns

**Stack Navigation:**
```typescript
import { router } from 'expo-router';

// Navigate to a screen
router.push('/login');

// Navigate back
router.back();

// Replace current screen
router.replace('/home');
```

**Tab Navigation:**
Configured in `app/(tabs)/_layout.tsx` using a custom tab bar component (`components/TabBar.tsx`).

---

## Styling Conventions

### NativeWind (Tailwind CSS)

The app uses **NativeWind v4** for styling, which brings Tailwind CSS utility classes to React Native.

#### Theme Configuration

**Theme tokens are defined in:**
1. `global.css` - CSS custom properties (CSS variables)
2. `lib/theme.ts` - Navigation theme colors
3. `tailwind.config.js` - Tailwind configuration

**Example from `global.css`:**
```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  /* ... more theme tokens */
}
```

#### Font Configuration

Custom fonts are loaded in `app/_layout.tsx`:
```typescript
const [loaded] = useFonts({
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
});
```

Tailwind font classes (from `tailwind.config.js`):
- `font-poppins` - Regular (400)
- `font-poppins-semibold` - SemiBold (600)
- `font-poppins-bold` - Bold (700)

#### Using Tailwind Classes

```tsx
import { View, Text } from 'react-native';

export default function Example() {
  return (
    <View className="flex-1 bg-background px-4 py-6">
      <Text className="text-2xl font-poppins-bold text-foreground">
        Hello World
      </Text>
    </View>
  );
}
```

---

## Component Structure

### UI Primitives

Base UI components are located in `components/ui/`:

| Component | Purpose | Usage |
|-----------|---------|-------|
| `button.tsx` | Button with variants | Primary, secondary, destructive, etc. |
| `text.tsx` | Text with variants | H1, H2, P, muted, etc. |
| `input.tsx` | Text input field | Form inputs |
| `card.tsx` | Card container | Content grouping |
| `separator.tsx` | Divider line | Visual separation |
| `icon.tsx` | Icon wrapper | Lucide icons |
| `label.tsx` | Form label | Input labels |

### Component Variant Pattern

Components use **Class Variance Authority (CVA)** for variants:

**Example from `components/ui/button.tsx`:**
```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-md gap-2',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        secondary: 'bg-secondary',
        destructive: 'bg-destructive',
        ghost: 'bg-transparent',
      },
      size: {
        default: 'h-12 px-6',
        sm: 'h-10 px-4',
        lg: 'h-14 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

**Usage:**
```tsx
import { Button } from '@/components/ui/button';

<Button variant="secondary" size="lg">
  Click Me
</Button>
```

### Utility Functions

**`lib/utils.ts`** - Contains the `cn()` helper function:

```typescript
import { cn } from '@/lib/utils';

<View className={cn(
  'flex-1 bg-background',
  isActive && 'bg-primary',
  'px-4'
)} />
```

This function merges Tailwind classes and handles conditional classes using `clsx` and `tailwind-merge`.

---

## State Management

### Current Approach

The application currently uses React's built-in state management:

- **Component State:** `useState` for local component state
- **Cross-component Communication:** Props drilling and context (where needed)

### Future Considerations

For more complex state management needs, consider:
- **Zustand** - Lightweight state management
- **React Query / TanStack Query** - Server state management
- **Jotai** - Atomic state management

---

## Development Guidelines

### Import Aliases

TypeScript is configured with path aliases (`tsconfig.json`):

```typescript
// Absolute imports using @ alias
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';
```

**Base path:** `@/` maps to the workspace root.

### Screen Layout Pattern

Most screens follow this pattern:

```tsx
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

export default function ScreenName() {
  return (
    <LinearGradient
      colors={['#FFFFFF', '#F5F5F5']}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1 px-4">
          {/* Screen content */}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
```

### Custom Tab Bar

The app uses a custom floating tab bar (`components/TabBar.tsx`) configured in `app/(tabs)/_layout.tsx`:

```typescript
<Tabs tabBar={(props) => <TabBar {...props} />}>
  {/* Tab screens */}
</Tabs>
```

---

## Best Practices

### Component Creation

1. **Use UI primitives** from `components/ui/` for consistency
2. **Create feature-specific components** in `features/[feature]/components/`
3. **Keep components small and focused** - single responsibility
4. **Use TypeScript interfaces** for props

### Styling

1. **Prefer Tailwind classes** over inline styles
2. **Use theme tokens** from `global.css` for colors
3. **Use the `cn()` utility** for conditional classes
4. **Follow font conventions** - use Poppins font variants

### Navigation

1. **Use Expo Router's typed routes** (configured with `experiments.typedRoutes`)
2. **Organize related screens** in route groups
3. **Use layouts** (`_layout.tsx`) for shared UI

### Code Organization

1. **Feature-based structure** - Group related components by feature
2. **Shared components** - Place in `components/`
3. **Utilities** - Place in `lib/`
4. **Types** - Define in component files or separate types files

### Performance

1. **Use React.memo** for expensive components
2. **Optimize heavy lists** with FlashList or FlatList
3. **Lazy load screens** where appropriate
4. **Use React Native Reanimated** for smooth animations

### TypeScript

1. **Enable strict mode** (already configured)
2. **Define proper prop types** for all components
3. **Avoid `any`** type - use proper typing
4. **Use type inference** where possible

---

## Adding New Features

### 1. Create a New Screen

```bash
# Navigate to appropriate route group
touch app/(main)/NewScreen.tsx
```

**NewScreen.tsx:**
```tsx
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export default function NewScreen() {
  return (
    <View className="flex-1 bg-background p-4">
      <Text variant="h1">New Screen</Text>
    </View>
  );
}
```

### 2. Add Feature Components

```bash
# Create feature directory
mkdir -p features/new-feature/components

# Add components
touch features/new-feature/components/NewComponent.tsx
```

### 3. Add UI Components

```bash
# Use React Native Reusables CLI
npx react-native-reusables/cli@latest add [component-name]
```

---

## Testing Strategy

### Current Setup

- **Development Testing:** Manual testing via Expo Go or simulators
- **Type Safety:** TypeScript compilation

### Recommended Additions

1. **Unit Testing:** Jest + React Native Testing Library
2. **E2E Testing:** Maestro or Detox
3. **Linting:** ESLint with React Native plugins
4. **Type Checking:** `tsc --noEmit` in CI/CD

---

## Code Style

### Formatting

The project uses **Prettier** for code formatting:
- Configured with `prettier-plugin-tailwindcss` for automatic Tailwind class sorting
- Run: `npx prettier --write .`

### Naming Conventions

- **Components:** PascalCase (`UserProfile.tsx`)
- **Files:** PascalCase for components, camelCase for utilities
- **Functions:** camelCase (`handleSubmit`, `getUserData`)
- **Constants:** UPPER_SNAKE_CASE (`API_URL`, `MAX_ITEMS`)
- **Types/Interfaces:** PascalCase (`type UserData`, `interface ButtonProps`)

---

## Environment-Specific Code

Use Expo's platform detection:

```typescript
import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  // iOS-specific code
} else if (Platform.OS === 'android') {
  // Android-specific code
} else if (Platform.OS === 'web') {
  // Web-specific code
}
```

---

## Performance Optimization

### Images

```typescript
import { Image } from 'expo-image';

// Use expo-image for better performance
<Image
  source={require('@/assets/images/photo.png')}
  contentFit="cover"
  transition={200}
/>
```

### Lists

```typescript
import { FlashList } from '@shopify/flash-list';

// Use FlashList for large lists (if installed)
<FlashList
  data={items}
  renderItem={({ item }) => <Item data={item} />}
  estimatedItemSize={100}
/>
```

---

## Debugging

### Tools Available

1. **Expo DevTools** - Built-in debugging interface
2. **React DevTools** - Component inspection
3. **Console Logs** - Standard debugging
4. **Expo Doctor** - Diagnose project issues: `npx expo-doctor`

### Common Debug Commands

```bash
# Clear Metro cache
npm run dev  # Already includes -c flag

# Check for project issues
npx expo-doctor

# View device logs
npx react-native log-ios
npx react-native log-android
```

---

## Additional Notes

### New Architecture

This project has the React Native **New Architecture** enabled (`newArchEnabled: true` in `app.json`).

Benefits:
- Better performance
- Faster startup time
- Improved type safety
- Support for new features

### Expo Features

The project uses several Expo modules:
- `expo-font` - Custom font loading
- `expo-router` - File-based routing
- `expo-linear-gradient` - Gradient backgrounds
- `expo-blur` - Blur effects
- `expo-system-ui` - System UI configuration

---

## Support & Resources

- **Project Documentation:** `/docs` directory
- **Expo Docs:** https://docs.expo.dev/
- **React Native Docs:** https://reactnative.dev/
- **NativeWind Docs:** https://www.nativewind.dev/
- **Tailwind CSS:** https://tailwindcss.com/

---

**Last Updated:** February 2026
