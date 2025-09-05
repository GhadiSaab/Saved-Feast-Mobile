# Contributing to SavedFeast Mobile App 🤝

Thank you for your interest in contributing to SavedFeast Mobile App! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- **Respectful Communication**: Use welcoming and inclusive language
- **Professional Behavior**: Be respectful of differing viewpoints and experiences
- **Constructive Feedback**: Gracefully accept constructive criticism
- **Focus on Impact**: Focus on what is best for the community
- **Empathy**: Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Expo CLI (`npm install -g @expo/cli`)
- Git
- A code editor (VS Code recommended)

### Fork and Clone

1. **Fork the repository**
   - Go to [SavedFeast Mobile App](https://github.com/yourusername/savedfeast-mobile)
   - Click the "Fork" button in the top right

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/savedfeast-mobile.git
   cd savedfeast-mobile
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/yourusername/savedfeast-mobile.git
   ```

## 🔧 Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Update with your configuration
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Start Development Server

```bash
npm start
```

### 4. Run on Device/Simulator

- **iOS Simulator**: Press `i` in terminal
- **Android Emulator**: Press `a` in terminal
- **Physical Device**: Scan QR code with Expo Go app

## 📝 Coding Standards

### TypeScript Guidelines

- **Strict Mode**: Always use strict TypeScript configuration
- **Type Definitions**: Define proper types for all functions and components
- **Interfaces**: Use interfaces for object shapes and API responses
- **Enums**: Use enums for constants and status values

```typescript
// ✅ Good
interface Meal {
  id: number;
  title: string;
  description: string;
  price: number;
  category: Category;
}

enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// ❌ Avoid
const meal: any = { id: 1, title: 'Pizza' };
```

### React Native Best Practices

- **Functional Components**: Use functional components with hooks
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Performance**: Use React.memo for expensive components
- **Accessibility**: Include accessibility props

```typescript
// ✅ Good
import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const Button = memo<ButtonProps>(({ title, onPress, disabled }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityLabel={title}
      accessibilityRole="button"
    >
      <View>
        <Text>{title}</Text>
      </View>
    </TouchableOpacity>
  );
});
```

### File and Folder Naming

- **Components**: PascalCase (e.g., `MealCard.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useMealData.ts`)
- **Utilities**: camelCase (e.g., `apiHelpers.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### Import Organization

```typescript
// 1. React and React Native imports
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Third-party library imports
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// 3. Expo imports
import { LinearGradient } from 'expo-linear-gradient';

// 4. Local imports (absolute paths)
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

// 5. Relative imports
import { styles } from './styles';
```

## 🧪 Testing Guidelines

### Test Structure

```
tests/
├── components/           # Component tests
│   ├── __snapshots__/   # Snapshot files
│   ├── MealCard.test.tsx
│   └── Button.test.tsx
├── hooks/               # Hook tests
│   └── useAuth.test.ts
├── lib/                 # Service tests
│   ├── api.test.ts
│   └── auth.test.ts
└── __mocks__/          # Mock files
    └── expo-secure-store.ts
```

### Writing Tests

```typescript
// ✅ Good test example
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MealCard } from '../MealCard';

describe('MealCard', () => {
  const mockMeal = {
    id: 1,
    title: 'Margherita Pizza',
    description: 'Classic tomato and mozzarella',
    price: 15.99,
    originalPrice: 25.99,
  };

  const mockOnPress = jest.fn();

  it('renders meal information correctly', () => {
    const { getByText } = render(
      <MealCard meal={mockMeal} onPress={mockOnPress} />
    );

    expect(getByText('Margherita Pizza')).toBeTruthy();
    expect(getByText('Classic tomato and mozzarella')).toBeTruthy();
    expect(getByText('$15.99')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <MealCard meal={mockMeal} onPress={mockOnPress} />
    );

    fireEvent.press(getByTestId('meal-card'));
    expect(mockOnPress).toHaveBeenCalledWith(mockMeal);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- MealCard.test.tsx
```

## 🔄 Pull Request Process

### 1. Create a Feature Branch

```bash
git checkout -b feature/amazing-feature
```

### 2. Make Your Changes

- Write clean, well-documented code
- Add tests for new functionality
- Update documentation if needed
- Follow the coding standards

### 3. Commit Your Changes

Use conventional commit messages:

```bash
# Format: type(scope): description
git commit -m 'feat(meals): add meal filtering functionality'
git commit -m 'fix(auth): resolve token refresh issue'
git commit -m 'docs(readme): update installation instructions'
```

**Commit Types:**

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

### 4. Push to Your Fork

```bash
git push origin feature/amazing-feature
```

### 5. Create a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the PR template
5. Submit the PR

### 6. PR Review Process

- **Code Review**: At least one maintainer must approve
- **CI Checks**: All tests must pass
- **Code Coverage**: Maintain >80% coverage
- **Documentation**: Update docs for new features

## 🐛 Issue Reporting

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** for solutions
3. **Try the latest version** of the app

### Issue Template

When creating an issue, please use the provided template and include:

- **Description**: Clear description of the problem
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: Device, OS, app version
- **Screenshots**: If applicable
- **Logs**: Error logs or console output

### Example Issue

```markdown
## Bug Report

### Description

The meal card doesn't display the correct price when the meal is discounted.

### Steps to Reproduce

1. Open the app
2. Navigate to the meals feed
3. Look for a discounted meal
4. Notice the price display issue

### Expected Behavior

The meal card should show the discounted price prominently.

### Actual Behavior

The meal card shows the original price instead of the discounted price.

### Environment

- Device: iPhone 14 Pro
- OS: iOS 17.0
- App Version: 1.0.0
- API Version: Latest

### Screenshots

[Add screenshots here]

### Logs

[Add relevant logs here]
```

## 💡 Feature Requests

### Before Submitting a Feature Request

1. **Check existing issues** for similar requests
2. **Consider the impact** on the overall app
3. **Think about implementation** complexity

### Feature Request Template

```markdown
## Feature Request

### Problem Statement

[Describe the problem this feature would solve]

### Proposed Solution

[Describe your proposed solution]

### Alternative Solutions

[Describe any alternative solutions you've considered]

### Additional Context

[Add any other context, screenshots, or examples]
```

## 📚 Additional Resources

### Documentation

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Testing Library Documentation](https://testing-library.com/docs/react-native-testing-library/intro/)

### Tools and Extensions

**VS Code Extensions:**

- ESLint
- Prettier
- TypeScript Importer
- React Native Tools
- Auto Rename Tag

**Development Tools:**

- React Native Debugger
- Flipper
- Expo DevTools

## 🎉 Recognition

Contributors will be recognized in:

- **README.md**: Contributors section
- **Release Notes**: Feature contributors
- **GitHub**: Contributor graph and profile

## 📞 Getting Help

If you need help with contributing:

- **GitHub Discussions**: Use the Discussions tab
- **Issues**: Create an issue for questions
- **Documentation**: Check the docs folder
- **Community**: Join our community channels

---

Thank you for contributing to SavedFeast Mobile App! 🚀
