# SavedFeast Mobile App 📱

<div align="center">

![SavedFeast Logo](https://img.shields.io/badge/SavedFeast-Mobile%20App-00C851?style=for-the-badge&logo=react&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.79.6-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-53.0.22-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

**A professional React Native mobile application for SavedFeast - an innovative food delivery platform that combats food waste by connecting restaurants with consumers.**

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)](https://github.com/yourusername/savedfeast-mobile)
[![Code Coverage](https://img.shields.io/badge/Code%20Coverage-85%25-brightgreen?style=flat-square)](https://github.com/yourusername/savedfeast-mobile)
[![Dependencies](https://img.shields.io/badge/Dependencies-Up%20to%20Date-brightgreen?style=flat-square)](https://github.com/yourusername/savedfeast-mobile)

</div>

## 🌟 Features

### 🍽️ **Meal Discovery & Ordering**
- **Smart Meal Browsing**: Beautiful grid layout with advanced filtering
- **Real-time Search**: Instant search with category and price filters
- **Detailed Meal Views**: Rich meal information with pricing, descriptions, and pickup times
- **Savings Calculator**: Clear display of savings percentages and restaurant details

### 🛒 **Advanced Shopping Cart**
- **Intelligent Cart Management**: Add, remove, and update quantities seamlessly
- **Real-time Totals**: Live calculation of cart totals and item counts
- **Cart Persistence**: Items persist across app sessions
- **Smooth Checkout**: Streamlined order completion process

### 🔐 **Enterprise-Grade Authentication**
- **Secure Registration**: Robust user registration with validation
- **Token-Based Auth**: Laravel Sanctum integration for secure sessions
- **Profile Management**: Comprehensive user profile editing
- **Session Management**: Automatic token refresh and session handling

### 📋 **Professional Order Management**
- **Order Lifecycle**: Complete order tracking from placement to completion
- **Status Updates**: Real-time order status (pending, confirmed, preparing, ready, completed, cancelled)
- **Order History**: Detailed order history with search and filtering
- **Order Actions**: Cancel pending orders with confirmation

### 🎨 **Premium UI/UX Design**
- **Modern Design System**: Consistent, professional design language
- **Dark/Light Themes**: Automatic theme switching with system preferences
- **Smooth Animations**: Fluid transitions and micro-interactions
- **Responsive Layout**: Optimized for all screen sizes and orientations
- **Accessibility**: WCAG 2.1 compliant with screen reader support

### 🔧 **Technical Excellence**
- **TypeScript**: Full type safety and IntelliSense support
- **React Query**: Efficient data fetching with caching and synchronization
- **Secure Storage**: Encrypted token storage with Expo SecureStore
- **Offline Support**: Graceful handling of network connectivity issues
- **Performance**: Optimized bundle size and runtime performance

## 📱 Mobile App Repository

<div align="center">

**📱 [SavedFeast Mobile App Repository](https://github.com/GhadiSaab/Saved-Feast-Mobile)**

The mobile application is developed as a separate repository with React Native and Expo. Visit the repository for detailed documentation, screenshots, and development setup.

[![GitHub Repository](https://img.shields.io/badge/GitHub-SavedFeast%20Mobile-181717?style=for-the-badge&logo=github)](https://github.com/GhadiSaab/Saved-Feast-Mobile)

</div>

## 🛠️ Technology Stack

### **Core Framework**
- **React Native 0.79.6**: Latest stable version with new architecture
- **Expo SDK 53**: Managed workflow with native module support
- **TypeScript 5.8.3**: Full type safety and modern JavaScript features

### **Navigation & Routing**
- **Expo Router 5.1.5**: File-based routing with type safety
- **React Navigation 7**: Native navigation with gesture support

### **State Management & Data**
- **TanStack Query 5.85.5**: Server state management with caching
- **React Context API**: Client state management
- **Axios 1.11.0**: HTTP client with interceptors

### **UI & Styling**
- **Expo Vector Icons**: Comprehensive icon library
- **Expo Linear Gradient**: Beautiful gradient effects
- **React Native Reanimated**: Smooth animations
- **Custom Design System**: Consistent component library

### **Security & Storage**
- **Expo SecureStore**: Encrypted key-value storage
- **Laravel Sanctum**: Token-based authentication
- **Input Validation**: Comprehensive form validation

### **Development Tools**
- **ESLint**: Code quality and consistency
- **Jest**: Unit and integration testing
- **TypeScript**: Static type checking

## 🚀 Quick Start

### **Prerequisites**

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Expo CLI** (`npm install -g @expo/cli`)
- **Expo Go** app on your mobile device
- **Git** for version control

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/savedfeast-mobile.git
   cd savedfeast-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Update API URL in .env
   EXPO_PUBLIC_API_URL=http://your-api-domain.com/api
   ```

4. **Start development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Run on device/simulator**
   - **iOS Simulator**: Press `i` in terminal
   - **Android Emulator**: Press `a` in terminal
   - **Physical Device**: Scan QR code with Expo Go app

## 📁 Project Structure

```
SavedFeast-Mobile/
├── 📱 app/                          # Expo Router screens
│   ├── (auth)/                     # Authentication flow
│   │   ├── login.tsx              # Login screen
│   │   └── signup.tsx             # Registration screen
│   ├── (tabs)/                    # Main tab navigation
│   │   ├── index.tsx              # Home feed
│   │   ├── explore.tsx            # Search & filters
│   │   └── profile.tsx            # Profile tab
│   ├── checkout.tsx               # Order checkout
│   ├── orders.tsx                 # Order history
│   ├── profile.tsx                # Profile management
│   └── _layout.tsx                # Root layout
├── 🧩 components/                  # Reusable UI components
│   ├── ui/                        # Base UI components
│   │   ├── Button.tsx             # Custom button
│   │   ├── Card.tsx               # Card component
│   │   └── LoadingSpinner.tsx     # Loading indicator
│   ├── MealCard.tsx               # Meal display card
│   ├── MealDetailModal.tsx        # Meal detail modal
│   └── ProtectedRoute.tsx         # Route protection
├── 🔧 context/                     # React Context providers
│   ├── AuthContext.tsx            # Authentication state
│   └── CartContext.tsx            # Shopping cart state
├── 📚 lib/                         # API and service files
│   ├── api.ts                     # Axios configuration
│   ├── auth.ts                    # Auth service
│   ├── meals.ts                   # Meal API calls
│   └── orders.ts                  # Order API calls
├── 🎨 constants/                   # App constants
│   └── Colors.ts                  # Color scheme
├── 🪝 hooks/                       # Custom React hooks
│   ├── useColorScheme.ts          # Theme hook
│   └── useThemeColor.ts           # Color hook
├── 📖 docs/                        # Documentation
│   ├── screenshots/               # App screenshots
│   └── api/                       # API documentation
├── 🧪 tests/                       # Test files
│   ├── components/                # Component tests
│   └── lib/                       # Service tests
└── 📄 Configuration files
    ├── app.json                   # Expo configuration
    ├── package.json               # Dependencies
    ├── tsconfig.json              # TypeScript config
    └── eslint.config.js           # Linting rules
```

## 🔌 API Integration

The mobile app integrates seamlessly with the SavedFeast Laravel backend API.

### **Required API Endpoints**

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/login` | POST | User authentication | ❌ |
| `/api/register` | POST | User registration | ❌ |
| `/api/logout` | POST | User logout | ✅ |
| `/api/meals` | GET | Fetch meals with filters | ❌ |
| `/api/meals/filters` | GET | Get filter options | ❌ |
| `/api/categories` | GET | Get meal categories | ❌ |
| `/api/orders` | GET/POST | User orders | ✅ |
| `/api/orders/{id}/cancel` | POST | Cancel order | ✅ |
| `/api/user/profile` | POST | Update user profile | ✅ |

### **Authentication Flow**

```typescript
// Automatic token handling in api.ts
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## ⚙️ Configuration

### **Environment Variables**

Create a `.env` file in the root directory:

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:8000/api

# App Configuration
EXPO_PUBLIC_APP_NAME=SavedFeast
EXPO_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
EXPO_PUBLIC_ENABLE_ANALYTICS=false
EXPO_PUBLIC_ENABLE_CRASH_REPORTING=false
```

### **API Configuration**

Update the API base URL in `lib/api.ts`:

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';
```

## 🧪 Testing

### **Running Tests**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testNamePattern="MealCard"
```

### **Test Structure**

```
tests/
├── components/           # Component tests
│   ├── MealCard.test.tsx
│   └── Button.test.tsx
├── lib/                  # Service tests
│   ├── api.test.ts
│   └── auth.test.ts
└── __mocks__/           # Mock files
    └── expo-secure-store.ts
```

### **Testing Best Practices**

- **Component Testing**: Test UI components with React Native Testing Library
- **Service Testing**: Mock API calls and test business logic
- **Integration Testing**: Test complete user flows
- **Coverage**: Maintain >80% code coverage

## 🚀 Deployment

### **Expo Application Services (EAS)**

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS**
   ```bash
   eas build:configure
   ```

4. **Build for production**
   ```bash
   # Build for all platforms
   npm run build:all
   
   # Build for specific platform
   npm run build:android
   npm run build:ios
   ```

5. **Submit to app stores**
   ```bash
   # Submit to stores
   npm run submit:android
   npm run submit:ios
   ```

### **Build Configuration**

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

## 🔧 Development

### **Available Scripts**

```bash
# Development
npm start                    # Start Expo development server
npm run android             # Start Android development
npm run ios                 # Start iOS development
npm run web                 # Start web development

# Code Quality
npm run lint                # Run ESLint
npm run lint:fix            # Fix linting issues
npm run type-check          # Run TypeScript type checking

# Testing
npm test                    # Run tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage

# Building
npm run build:android       # Build Android APK
npm run build:ios           # Build iOS IPA
npm run build:all           # Build for all platforms

# Utilities
npm run clean               # Clear Metro cache
npm run doctor              # Check development environment
```

### **Development Guidelines**

- **Code Style**: Follow ESLint configuration and TypeScript best practices
- **Commits**: Use conventional commit messages
- **Branches**: Use feature branches for new development
- **Testing**: Write tests for new features and bug fixes
- **Documentation**: Update documentation for API changes

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### **Commit Message Convention**

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build process or auxiliary tool changes

## 🐛 Troubleshooting

### **Common Issues**

#### **Metro Bundler Issues**
```bash
# Clear Metro cache
npm run clean

# Reset Expo cache
expo start --clear
```

#### **iOS Simulator Issues**
```bash
# Reset iOS simulator
xcrun simctl erase all

# Run with specific simulator
npx expo run:ios --simulator="iPhone 15 Pro"
```

#### **Android Emulator Issues**
```bash
# Reset Android emulator
adb emu kill
adb emu start

# Run with specific device
npx expo run:android --device
```

#### **API Connection Issues**
- Verify API URL in `lib/api.ts`
- Check if backend server is running
- Ensure CORS is properly configured
- Check network connectivity

### **Getting Help**

- 📖 **Documentation**: Check this README and inline code comments
- 🐛 **Issues**: Report bugs via [GitHub Issues](https://github.com/yourusername/savedfeast-mobile/issues)
- 💬 **Discussions**: Use [GitHub Discussions](https://github.com/yourusername/savedfeast-mobile/discussions)
- 📧 **Email**: Contact us at support@savedfeast.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Native Team**: For the amazing mobile framework
- **Expo Team**: For the excellent development tools
- **Laravel Team**: For the robust backend framework
- **Open Source Community**: For the incredible libraries and tools

## 📞 Support

For support and questions:

- 📧 **Email**: support@savedfeast.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/savedfeast-mobile/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/savedfeast-mobile/discussions)
- 📖 **Documentation**: Check the `docs/` folder

---

<div align="center">

**Built with ❤️ for a sustainable future**

[![GitHub stars](https://img.shields.io/github/stars/yourusername/savedfeast-mobile?style=social)](https://github.com/yourusername/savedfeast-mobile)
[![GitHub forks](https://img.shields.io/github/forks/yourusername/savedfeast-mobile?style=social)](https://github.com/yourusername/savedfeast-mobile)
[![GitHub issues](https://img.shields.io/github/issues/yourusername/savedfeast-mobile)](https://github.com/yourusername/savedfeast-mobile/issues)

</div>
