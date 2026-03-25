# LuvLots - Contributing Guidelines

This document outlines the development workflow, coding standards, and contribution guidelines for the LuvLots project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Git Workflow](#git-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [Common Tasks](#common-tasks)

---

## Getting Started

Before contributing, ensure you have:

1. ✅ Completed the setup process (see [SETUP.md](./SETUP.md))
2. ✅ Read the architecture guide (see [ARCHITECTURE.md](./ARCHITECTURE.md))
3. ✅ Familiarized yourself with the codebase
4. ✅ Set up your development environment

---

## Development Workflow

### 1. Pick a Task

- Check the project board/issue tracker
- Assign yourself to the task
- Understand requirements before starting

### 2. Create a Branch

```bash
# Update your local main branch
git checkout main
git pull origin main

# Create a feature branch
git checkout -b feature/task-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 3. Development

```bash
# Start the development server
npm run dev

# Make your changes
# Test on different platforms as needed
```

### 4. Testing

Test your changes on relevant platforms:

```bash
# iOS (macOS only)
npm run ios

# Android
npm run android

# Web
npm run web
```

### 5. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add user authentication flow"
```

### 6. Push and Create PR

```bash
# Push your branch
git push origin feature/task-name

# Create a pull request on GitHub
```

---

## Git Workflow

### Branch Naming Convention

Use the following prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `style/` - Code style changes (formatting, etc.)
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

**Examples:**
```
feature/user-profile
fix/login-validation
refactor/cart-component
docs/setup-guide
```

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `docs` - Documentation
- `style` - Formatting, missing semicolons, etc.
- `test` - Adding tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

**Examples:**
```bash
git commit -m "feat(auth): implement login screen"
git commit -m "fix(cart): resolve checkout calculation error"
git commit -m "refactor(ui): simplify button component variants"
git commit -m "docs: update setup instructions for Android"
```

**Good commit message:**
```
feat(checkout): add payment method selection

- Add PaymentOption component
- Implement payment method state management
- Add validation for required fields

Closes #123
```

### Branch Protection

- **main** branch is protected
- All changes must go through pull requests
- PRs require at least one approval
- All checks must pass before merging

---

## Coding Standards

### TypeScript

**✅ DO:**
```typescript
// Define proper interfaces
interface UserProps {
  name: string;
  email: string;
  age?: number;
}

// Use type inference
const userName = 'John Doe';

// Use proper typing for components
export default function UserProfile({ name, email }: UserProps) {
  // ...
}
```

**❌ DON'T:**
```typescript
// Avoid 'any' type
const data: any = fetchData();

// Don't skip prop types
export default function UserProfile(props) {
  // ...
}
```

### React Native Components

**✅ DO:**
```typescript
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Example() {
  const [isActive, setIsActive] = useState(false);

  return (
    <View className="flex-1 bg-background p-4">
      <Text variant="h1" className="mb-4">
        Title
      </Text>
      <Button
        variant={isActive ? 'default' : 'secondary'}
        onPress={() => setIsActive(!isActive)}
      >
        Toggle
      </Button>
    </View>
  );
}
```

**❌ DON'T:**
```typescript
// Don't use inline styles
<View style={{ flex: 1, padding: 16 }}>

// Don't use default Text/Button
import { Text, Button } from 'react-native';

// Don't mix styling approaches
<View style={styles.container} className="bg-red-500">
```

### Component Organization

**File structure within a component:**

```typescript
// 1. Imports
import { View } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  onSubmit: () => void;
}

// 3. Component
export default function Component({ title, onSubmit }: ComponentProps) {
  // 3a. Hooks
  const [value, setValue] = useState('');

  // 3b. Functions
  const handlePress = () => {
    onSubmit();
  };

  // 3c. Render
  return (
    <View className="flex-1">
      <Text>{title}</Text>
    </View>
  );
}
```

### Styling Guidelines

**✅ DO:**
```typescript
// Use Tailwind classes
<View className="flex-1 bg-background px-4 py-6">

// Use cn() for conditional classes
<View className={cn(
  'rounded-lg p-4',
  isActive && 'bg-primary',
  isDisabled && 'opacity-50'
)}>

// Use theme tokens
<View className="bg-background text-foreground">
```

**❌ DON'T:**
```typescript
// Don't use inline styles
<View style={{ backgroundColor: '#fff', padding: 16 }}>

// Don't hardcode colors
<View className="bg-[#ffffff]">

// Don't use StyleSheet.create (unless absolutely necessary)
const styles = StyleSheet.create({ ... });
```

---

## Pull Request Process

### Before Creating a PR

- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] Tested on relevant platforms (iOS, Android, Web)
- [ ] No console errors or warnings
- [ ] Code is properly typed (TypeScript)
- [ ] Commits are clean and descriptive
- [ ] Branch is up to date with main

### PR Template

Use this template when creating a PR:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactoring
- [ ] Documentation update
- [ ] Other (please describe)

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Tested on Web
- [ ] Tested in Expo Go

## Screenshots/Videos
(If applicable, add screenshots or screen recordings)

## Related Issues
Closes #123

## Checklist
- [ ] Code follows project standards
- [ ] Self-reviewed the code
- [ ] Commented complex code sections
- [ ] Updated documentation (if needed)
- [ ] No new warnings or errors
- [ ] Tested thoroughly
```

### PR Review Process

1. **Submit PR** - Create pull request with proper description
2. **Automated Checks** - Wait for CI/CD checks to pass
3. **Code Review** - Request review from team members
4. **Address Feedback** - Make requested changes
5. **Approval** - Get approval from reviewers
6. **Merge** - Merge to main branch
7. **Delete Branch** - Remove feature branch after merge

---

## Code Review Guidelines

### As a Reviewer

**What to look for:**

✅ **Code Quality**
- Follows project conventions
- Proper TypeScript usage
- No code smells
- Maintainable and readable

✅ **Functionality**
- Meets requirements
- Handles edge cases
- No breaking changes
- Proper error handling

✅ **Performance**
- No unnecessary re-renders
- Optimized list rendering
- Efficient state management
- No memory leaks

✅ **UI/UX**
- Matches design specs
- Responsive on different screen sizes
- Proper loading states
- Good user feedback

**How to provide feedback:**

✅ **DO:**
```
Consider using useMemo here to avoid recalculating on every render:
const filteredItems = useMemo(() => items.filter(...), [items]);
```

```
Great job implementing the error handling! 👍
```

❌ **DON'T:**
```
This code is bad.
```

```
Why didn't you do it this way?
```

### As a Code Author

**Responding to feedback:**

- ✅ Be open to suggestions
- ✅ Ask questions if unclear
- ✅ Explain your reasoning
- ✅ Make requested changes promptly
- ✅ Thank reviewers for their time

---

## Common Tasks

### Adding a New Screen

```bash
# 1. Create screen file
touch app/(main)/NewScreen.tsx
```

```typescript
// 2. Implement screen
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';

export default function NewScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4">
        <Text variant="h1">New Screen</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
```

```typescript
// 3. Navigate to screen
import { router } from 'expo-router';

router.push('/NewScreen');
```

### Adding a UI Component

```bash
# Use React Native Reusables CLI
npx react-native-reusables/cli@latest add switch
```

Or create a custom component:

```typescript
// components/ui/custom.tsx
import { View } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const customVariants = cva(
  'rounded-lg p-4',
  {
    variants: {
      variant: {
        default: 'bg-background',
        primary: 'bg-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface CustomProps extends VariantProps<typeof customVariants> {
  className?: string;
  children: React.ReactNode;
}

export function Custom({ variant, className, children }: CustomProps) {
  return (
    <View className={cn(customVariants({ variant }), className)}>
      {children}
    </View>
  );
}
```

### Adding a Feature Module

```bash
# Create feature directory structure
mkdir -p features/new-feature/components
touch features/new-feature/components/FeatureComponent.tsx
```

### Debugging Issues

```bash
# Clear all caches and restart
npm run clean
npm install
npm run dev

# Check for project issues
npx expo-doctor

# View logs
npx react-native log-ios    # iOS
npx react-native log-android # Android
```

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update a specific package
npm update <package-name>

# Update all packages (be cautious)
npm update

# After updating, test thoroughly
npm run dev
```

---

## Performance Best Practices

### 1. Optimize Re-renders

```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
const ExpensiveComponent = memo(({ data }) => {
  return <View>{/* Render data */}</View>;
});

// Memoize expensive calculations
const sortedData = useMemo(() => 
  data.sort((a, b) => a.value - b.value),
  [data]
);

// Memoize callbacks
const handlePress = useCallback(() => {
  console.log('Pressed');
}, []);
```

### 2. Optimize Lists

```typescript
import { FlatList } from 'react-native';

<FlatList
  data={items}
  renderItem={({ item }) => <Item data={item} />}
  keyExtractor={(item) => item.id}
  // Performance optimizations
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  windowSize={21}
/>
```

### 3. Optimize Images

```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  contentFit="cover"
  cachePolicy="memory-disk"
/>
```

---

## Troubleshooting Development Issues

### Metro Bundler Issues

```bash
# Clear cache and restart
npm run dev

# If that doesn't work
npm run clean
npm install
npm run dev
```

### TypeScript Errors

```bash
# Check for type errors
npx tsc --noEmit

# Restart TypeScript server in VS Code
# CMD/CTRL + Shift + P -> "TypeScript: Restart TS Server"
```

### Platform-Specific Issues

**iOS:**
```bash
cd ios
pod install
cd ..
npm run ios
```

**Android:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

---

## Resources for Developers

### Official Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [NativeWind](https://www.nativewind.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

### Helpful Tools

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Flipper](https://fbflipper.com/)
- [Reactotron](https://github.com/infinitered/reactotron)

### Learning Resources

- [Expo YouTube Channel](https://www.youtube.com/@expo)
- [React Native Express](https://www.reactnative.express/)
- [UI Kitten (Design System Reference)](https://akveo.github.io/react-native-ui-kitten/)

---

## Getting Help

If you're stuck:

1. **Check Documentation** - Review project docs and official documentation
2. **Search Issues** - Check if someone else had the same problem
3. **Ask Team** - Reach out to team members
4. **Debug Systematically** - Use console logs, debugger, React DevTools
5. **Create Issue** - If it's a bug, document it properly

---

## Code Quality Checklist

Before submitting a PR, ensure:

- [ ] Code follows TypeScript best practices
- [ ] Components use proper prop types
- [ ] Styling uses NativeWind/Tailwind classes
- [ ] No console.log statements left in code (unless intentional)
- [ ] No unnecessary comments
- [ ] No unused imports
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] Empty states handled
- [ ] Responsive on different screen sizes
- [ ] Tested on both platforms (iOS & Android)
- [ ] No accessibility issues

---

## Final Notes

- **Communication is key** - Ask questions, share updates, collaborate
- **Quality over speed** - Write clean, maintainable code
- **Learn continuously** - Stay updated with best practices
- **Help others** - Review PRs, answer questions, share knowledge
- **Have fun!** - Enjoy building great features 🚀

---

**Happy coding!**
