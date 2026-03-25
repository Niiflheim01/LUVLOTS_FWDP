# LuvLots Documentation

Welcome to the LuvLots project documentation! This directory contains comprehensive guides to help you understand, set up, and contribute to the project.

## 📚 Documentation Overview

### [SETUP.md](./SETUP.md)
**Getting Started Guide**

Complete setup instructions for new developers joining the project. Covers:
- Prerequisites and system requirements
- Installation steps
- Platform-specific setup (iOS, Android, Web)
- Running the application
- Troubleshooting common issues

**Start here if you're new to the project!**

---

### [ARCHITECTURE.md](./ARCHITECTURE.md)
**Architecture & Development Guide**

Deep dive into the application's architecture and technical implementation. Covers:
- Technology stack and dependencies
- Application structure and organization
- Routing and navigation patterns
- Styling conventions with NativeWind
- Component structure and patterns
- State management approach
- Best practices and guidelines

**Read this to understand how the app is built!**

---

### [CONTRIBUTING.md](./CONTRIBUTING.md)
**Contributing Guidelines**

Guidelines for contributing code to the project. Covers:
- Development workflow
- Git workflow and branching strategy
- Coding standards and conventions
- Pull request process
- Code review guidelines
- Common development tasks
- Performance optimization tips

**Follow this when making changes to the codebase!**

---

## 🚀 Quick Start

1. **First time setup?** → Start with [SETUP.md](./SETUP.md)
2. **Want to understand the architecture?** → Read [ARCHITECTURE.md](./ARCHITECTURE.md)
3. **Ready to contribute?** → Follow [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📖 Additional Resources

### Project Technologies

- **[Expo](https://docs.expo.dev/)** - Development platform
- **[React Native](https://reactnative.dev/)** - Mobile framework
- **[Expo Router](https://docs.expo.dev/router/introduction/)** - File-based routing
- **[NativeWind](https://www.nativewind.dev/)** - Tailwind for React Native
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

### Key Concepts

- **File-based Routing**: Routes are defined by the file structure in `/app`
- **Route Groups**: Folders in parentheses `(auth)` group routes without affecting the URL
- **Tailwind Styling**: Use `className` prop with Tailwind utility classes
- **UI Components**: Reusable components in `/components/ui`
- **Feature Modules**: Feature-specific code in `/features`

---

## 🛠️ Quick Reference

### Essential Commands

```bash
# Start development server
npm run dev

# Run on specific platform
npm run ios      # iOS (macOS only)
npm run android  # Android
npm run web      # Web browser

# Clean and reinstall
npm run clean
npm install
```

### Project Structure

```
app/               # Expo Router screens and layouts
├── (auth)/        # Authentication screens
├── (main)/        # Main app screens  
├── (profile)/     # Profile screens
├── (tabs)/        # Tab navigation
components/        # Reusable UI components
├── ui/            # Base UI primitives
features/          # Feature-specific components
lib/               # Utilities and configurations
assets/            # Images, fonts, etc.
docs/              # Documentation (you are here!)
```

### Common Patterns

**Creating a screen:**
```typescript
// app/(main)/NewScreen.tsx
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

**Navigation:**
```typescript
import { router } from 'expo-router';

// Navigate to screen
router.push('/NewScreen');

// Go back
router.back();
```

**Styling with Tailwind:**
```typescript
<View className="flex-1 bg-background px-4 py-6">
  <Text className="text-2xl font-poppins-bold text-foreground">
    Hello World
  </Text>
</View>
```

---

## 🤝 Getting Help

If you need assistance:

1. **Check the documentation** in this directory
2. **Search existing issues** on GitHub
3. **Ask your team** members
4. **Consult official docs** for technologies used
5. **Create an issue** if you found a bug

---

## 📝 Documentation Maintenance

This documentation should be kept up-to-date as the project evolves.

**When to update documentation:**

- Adding new dependencies or technologies
- Changing project structure or conventions
- Updating setup requirements
- Adding new development workflows
- Discovering common issues and solutions

**Who maintains the docs:**

- All team members are responsible for keeping docs current
- Update relevant docs when making significant changes
- Include documentation updates in your PRs when applicable

---

## 📋 Document Index

| Document | Purpose | Audience |
|----------|---------|----------|
| [SETUP.md](./SETUP.md) | Installation and setup | New developers |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical architecture | All developers |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Development workflow | Contributors |
| README.md (this file) | Documentation overview | Everyone |

---

## 🎯 Next Steps

Based on your role or goal:

### New Team Member
1. Read [SETUP.md](./SETUP.md) and set up your environment
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the codebase
3. Familiarize yourself with [CONTRIBUTING.md](./CONTRIBUTING.md)
4. Explore the codebase and ask questions!

### Existing Developer
- Reference [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Follow [CONTRIBUTING.md](./CONTRIBUTING.md) for workflow guidelines
- Keep documentation updated as you work

### Tech Lead / Maintainer
- Ensure team follows conventions in [CONTRIBUTING.md](./CONTRIBUTING.md)
- Review and update documentation regularly
- Onboard new developers using these guides

---

## ✨ Contributing to Documentation

Found an error or want to improve the docs?

1. Edit the relevant markdown file
2. Follow the same PR process as code changes
3. Ensure changes are clear and accurate
4. Update this README if adding new documents

---

**Last Updated:** February 2026

**Questions?** Reach out to the development team!
