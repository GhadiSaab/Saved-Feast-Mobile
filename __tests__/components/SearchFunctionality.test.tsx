import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FeedScreen from '@/app/(tabs)/index';
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
  getMeals: jest.fn(),
  getFavorites: jest.fn(),
}));

// Mock the auth context
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

// Mock the cart context
jest.mock('@/context/CartContext', () => ({
  useCart: () => ({
    getItemCount: () => 0,
  }),
}));

// Mock the color scheme hook
jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

// Mock Animated
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Animated: {
      ...RN.Animated,
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
      event: jest.fn(),
      spring: jest.fn(),
      timing: jest.fn(),
      sequence: jest.fn(),
    },
  };
});

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

const mockFilterOptions = {
  categories: [
    { id: 1, name: 'Italian' },
    { id: 2, name: 'American' },
  ],
  sort_orders: [
    { value: 'created_at', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
  ],
};

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

describe('Search Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mealService.getMeals as jest.Mock).mockResolvedValue({
      data: mockMeals,
      pagination: { has_more_pages: false },
    });
    (mealService.getFavorites as jest.Mock).mockResolvedValue([]);
  });

  it('renders search input', async () => {
    renderWithProviders(<FeedScreen />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search for delicious meals...')).toBeTruthy();
    });
  });

  it('calls meal service with search term when typing', async () => {
    renderWithProviders(<FeedScreen />);
    
    const searchInput = screen.getByPlaceholderText('Search for delicious meals...');
    
    // Type in search input
    fireEvent.changeText(searchInput, 'pizza');
    
    // Wait for debounced search to trigger
    await waitFor(() => {
      expect(mealService.getMeals).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'pizza',
        })
      );
    }, { timeout: 1000 });
  });

  it('shows clear button when search term is entered', async () => {
    renderWithProviders(<FeedScreen />);
    
    const searchInput = screen.getByPlaceholderText('Search for delicious meals...');
    
    fireEvent.changeText(searchInput, 'pizza');
    
    await waitFor(() => {
      expect(screen.getByTestId('clear-search-button')).toBeTruthy();
    });
  });

  it('clears search when clear button is pressed', async () => {
    renderWithProviders(<FeedScreen />);
    
    const searchInput = screen.getByPlaceholderText('Search for delicious meals...');
    
    // Type in search input
    fireEvent.changeText(searchInput, 'pizza');
    
    // Wait for clear button to appear
    await waitFor(() => {
      const clearButton = screen.getByTestId('clear-search-button');
      fireEvent.press(clearButton);
    });
    
    // Check that search is cleared
    expect(searchInput.props.value).toBe('');
  });
});

describe('Filter Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mealService.getMeals as jest.Mock).mockResolvedValue({
      data: mockMeals,
      pagination: { has_more_pages: false },
    });
    (mealService.getFavorites as jest.Mock).mockResolvedValue([]);
    (mealService.getFilters as jest.Mock).mockResolvedValue(mockFilterOptions);
  });

  it('shows filter button', async () => {
    renderWithProviders(<FeedScreen />);
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-button')).toBeTruthy();
    });
  });

  it('opens filters when filter button is pressed', async () => {
    renderWithProviders(<FeedScreen />);
    
    const filterButton = screen.getByTestId('filter-button');
    fireEvent.press(filterButton);
    
    await waitFor(() => {
      expect(screen.getByText('Categories')).toBeTruthy();
    });
  });

  it('calls meal service with category filter when category is selected', async () => {
    renderWithProviders(<FeedScreen />);
    
    // Open filters
    const filterButton = screen.getByTestId('filter-button');
    fireEvent.press(filterButton);
    
    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('Italian')).toBeTruthy();
    });
    
    // Select a category
    const italianCategory = screen.getByText('Italian');
    fireEvent.press(italianCategory);
    
    // Check that meal service is called with category filter
    await waitFor(() => {
      expect(mealService.getMeals).toHaveBeenCalledWith(
        expect.objectContaining({
          category_id: 1,
        })
      );
    });
  });
});
