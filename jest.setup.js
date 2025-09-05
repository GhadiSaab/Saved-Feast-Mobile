import 'react-native-gesture-handler/jestSetup';

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      apiUrl: 'http://localhost:8000/api',
    },
  },
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn(),
  openURL: jest.fn(),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock expo-image
jest.mock('expo-image', () => 'Image');

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => 'LinearGradient');

// Mock expo-blur
jest.mock('expo-blur', () => 'BlurView');

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock expo-system-ui
jest.mock('expo-system-ui', () => ({
  setBackgroundColorAsync: jest.fn(),
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
}));

// Mock expo-symbols
jest.mock('expo-symbols', () => ({
  Symbol: 'Symbol',
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: 'Link',
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
  })),
  QueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
  })),
  QueryClientProvider: 'QueryClientProvider',
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

// Mock useColorScheme hook
jest.mock('./hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

// Mock ThemedText component
jest.mock('./components/ThemedText', () => ({
  ThemedText: 'ThemedText',
}));

// Mock @/components/ThemedText (alias)
jest.mock('@/components/ThemedText', () => ({
  ThemedText: 'ThemedText',
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

// Mock @react-navigation/bottom-tabs
jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: jest.fn(() => 0),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  default: {
    View: 'View',
    Text: 'Text',
    ScrollView: 'ScrollView',
  },
  useSharedValue: jest.fn(value => ({ value })),
  withRepeat: jest.fn((animation, iterations) => animation),
  withTiming: jest.fn((value, config) => value),
  withSequence: jest.fn((...animations) => animations[0]),
  useAnimatedStyle: jest.fn(style => style),
  Easing: {
    linear: jest.fn(),
  },
}));

// Mock react-native Dimensions and StyleSheet
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  TouchableHighlight: 'TouchableHighlight',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  FlatList: 'FlatList',
  Image: 'Image',
  TextInput: 'TextInput',
  Alert: {
    alert: jest.fn(),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 400, height: 800 })),
  },
  StyleSheet: {
    create: jest.fn(styles => styles),
    flatten: jest.fn(style => {
      if (Array.isArray(style)) {
        return style.reduce((acc, s) => ({ ...acc, ...s }), {});
      }
      return style || {};
    }),
    absoluteFill: {},
    absoluteFillObject: {},
    hairlineWidth: 1,
  },
  Platform: {
    OS: 'ios',
    select: jest.fn(obj => obj.ios || obj.default),
  },
  StatusBar: 'StatusBar',
  SafeAreaView: 'SafeAreaView',
  ActivityIndicator: 'ActivityIndicator',
  Animated: {
    Value: jest.fn(value => ({
      _value: value,
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
      stopAnimation: jest.fn(),
      interpolate: jest.fn(() => value),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(callback => callback && callback({ finished: true })),
    })),
    sequence: jest.fn(animations => ({
      start: jest.fn(callback => callback && callback({ finished: true })),
    })),
    parallel: jest.fn(animations => ({
      start: jest.fn(callback => callback && callback({ finished: true })),
    })),
    View: 'View',
    Text: 'Text',
    ScrollView: 'ScrollView',
    FlatList: 'FlatList',
    Image: 'Image',
  },
}));

// Global test setup
global.console = {
  ...console,
  // Suppress console output during tests
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Fix StyleSheet.flatten for testing
const { StyleSheet } = require('react-native');
if (StyleSheet && StyleSheet.flatten) {
  StyleSheet.flatten = jest.fn(style => {
    if (Array.isArray(style)) {
      return style.reduce((acc, s) => ({ ...acc, ...s }), {});
    }
    return style || {};
  });
}
