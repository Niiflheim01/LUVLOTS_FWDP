# Copilot Instructions

## Project Overview
- Expo + React Native app using Expo Router for file-based navigation; entry is `expo-router/entry` in `package.json`.
- Styling uses NativeWind (Tailwind classes on React Native) with theme tokens defined in `global.css` and `lib/theme.ts`.
- UI primitives live in `components/ui` and are composed with `class-variance-authority` + `tailwind-merge` (see `components/ui/button.tsx`, `components/ui/text.tsx`, `lib/utils.ts`).

## Architecture & Navigation
- Routes are grouped by Expo Router folders: `(auth)`, `(main)`, `(tabs)`, `(profile)` in `app/`.
- Root stack and theme setup are in `app/_layout.tsx` (fonts, splash screen, light theme lock).
- Tabs use a custom floating bar in `components/TabBar.tsx` and are wired in `app/(tabs)/_layout.tsx`.
- Screen layouts often wrap gradients + SafeAreaView + Tailwind classes (e.g., `app/(main)/index.tsx`, `app/(main)/CharityScreen.tsx`).

## Styling & Theming Conventions
- Use `className` with Tailwind utility strings (NativeWind). Fonts are `font-poppins`, `font-poppins-semibold`, `font-poppins-bold` from `tailwind.config.js`.
- Prefer `Text` and `Button` from `components/ui` to keep typography and variant styles consistent.
- Theme tokens are CSS variables in `global.css`; navigation colors map from `lib/theme.ts`.

## Imports & Aliases
- Absolute import alias `@/` points to workspace root (see `tsconfig.json`). Example: `@/components/ui/button`.

## Key Workflows
- Dev server: `npm run dev` (Expo start with cache clear).
- Platform shortcuts: `npm run ios`, `npm run android`, `npm run web`.
- Reset local state: `npm run clean` (removes `.expo` and `node_modules`).

## Patterns to Follow
- For new screens, mirror existing screen structure in `app/` and use Expo Router layouts.
- Use `cn()` from `lib/utils.ts` when composing className strings with variants.
- Use icons from `lucide-react-native` (common across screens).

## Examples to Reference
- Root layout + fonts + theme: `app/_layout.tsx`.
- Tab bar setup: `app/(tabs)/_layout.tsx` + `components/TabBar.tsx`.
- Tailwind theme tokens: `global.css` + `tailwind.config.js`.
- UI primitives: `components/ui/button.tsx`, `components/ui/text.tsx`.
