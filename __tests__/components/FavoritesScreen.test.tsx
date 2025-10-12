import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FavoritesScreen from '@/app/favorites';
import mealService from '@/lib/meals';

// Mock the router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock the meal service
jest.mock('@/lib/meals', () => ({
  getFavorites: jest.fn(),
}));

// Mock the auth context
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

// Mock the color scheme hook
jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

const mockMeals = [
  {
    id: 1,
    title: 'Delicious Pizza',
    description: 'A tasty pizza with fresh ingredients',
    price: 12.99,
    original_price: 15.99,
    image: 'https://example.com/pizza.jpg',
    restaurant: {
      id: 1,
      name: 'Pizza Palace',
    },
    category: {
      id: 1,
      name: 'Italian',
    },
  },
  {
    id: 2,
    title: 'Burger Deluxe',
    description: 'A juicy burger with all the fixings',
    price: 9.99,
    original_price: 12.99,
    image: 'https://example.com/burger.jpg',
    restaurant: {
      id: 2,
      name: 'Burger Joint',
    },
    category: {
      id: 2,
      name: 'American',
    },
  },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        {component}
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

describe('FavoritesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (mealService.getFavorites as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    renderWithProviders(<FavoritesScreen />);
    
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
  });

  it('renders empty state when no favorites', async () => {
    (mealService.getFavorites as jest.Mock).mockResolvedValue([]);
    
    renderWithProviders(<FavoritesScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('No Favorites Yet')).toBeTruthy();
      expect(screen.getByText('Start exploring meals and tap the heart icon to add them to your favorites!')).toBeTruthy();
      expect(screen.getByText('Explore Meals')).toBeTruthy();
    });
  });

  it('renders favorites list when favorites exist', async () => {
    (mealService.getFavorites as jest.Mock).mockResolvedValue(mockMeals);
    
    renderWithProviders(<FavoritesScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('Delicious Pizza')).toBeTruthy();
      expect(screen.getByText('Burger Deluxe')).toBeTruthy();
    });
  });

  it('navigates back when back button is pressed', async () => {
    const { router } = require('expo-router');
    (mealService.getFavorites as jest.Mock).mockResolvedValue([]);
    
    renderWithProviders(<FavoritesScreen />);
    
    await waitFor(() => {
      const backButton = screen.getByTestId('back-button');
      fireEvent.press(backButton);
      expect(router.back).toHaveBeenCalled();
    });
  });

  it('navigates to explore when explore button is pressed in empty state', async () => {
    const { router } = require('expo-router');
    (mealService.getFavorites as jest.Mock).mockResolvedValue([]);
    
    renderWithProviders(<FavoritesScreen />);
    
    await waitFor(() => {
      const exploreButton = screen.getByText('Explore Meals');
      fireEvent.press(exploreButton);
      expect(router.push).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('shows error state when favorites fetch fails', async () => {
    const errorMessage = 'Failed to fetch favorites';
    (mealService.getFavorites as jest.Mock).mockRejectedValue(new Error(errorMessage));
    
    renderWithProviders(<FavoritesScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to Load Favorites')).toBeTruthy();
      expect(screen.getByText(errorMessage)).toBeTruthy();
      expect(screen.getByText('Try Again')).toBeTruthy();
    });
  });
});
