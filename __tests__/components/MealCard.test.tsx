import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { MealCard } from '../../components/MealCard';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import mealService from '../../lib/meals';
import { router } from 'expo-router';

// Mock the context hooks
jest.mock('../../context/AuthContext');
jest.mock('../../context/CartContext');

// Mock the meals service
jest.mock('../../lib/meals', () => ({
  toggleFavorite: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock expo-image
jest.mock('expo-image', () => ({
  Image: 'Image',
}));

// Mock Alert
const mockAlert = jest.fn((title, message, buttons) => {
  // Simulate pressing the "Login" button immediately
  if (buttons && buttons[1] && buttons[1].onPress) {
    buttons[1].onPress();
  }
});

// Mock Alert directly
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: mockAlert,
    },
  };
});

// Also mock Alert at the module level
const Alert = require('react-native').Alert;
Alert.alert = mockAlert;

// Mock Dimensions is handled in jest.setup.js

const mockMeal = {
  id: 1,
  title: 'Delicious Pizza',
  description: 'A mouth-watering pizza with fresh ingredients',
  current_price: 15.99,
  original_price: 20.99,
  image: 'https://example.com/pizza.jpg',
  available_from: '2024-01-01T10:00:00Z',
  available_until: '2024-01-01T22:00:00Z',
  restaurant: {
    name: 'Pizza Palace',
  },
  category: {
    id: 1,
    name: 'Italian',
  },
};

describe('MealCard', () => {
  const mockAddToCart = jest.fn();
  const mockToggleFavorite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    });

    (useCart as jest.Mock).mockReturnValue({
      addToCart: mockAddToCart,
    });

    (mealService.toggleFavorite as jest.Mock).mockResolvedValue({
      is_favorited: true,
      meal_id: 1,
    });
  });

  it('should render meal information correctly', () => {
    const { getByText, getByTestId } = render(<MealCard meal={mockMeal} />);

    expect(getByText('Delicious Pizza')).toBeTruthy();
    expect(
      getByText('A mouth-watering pizza with fresh ingredients')
    ).toBeTruthy();
    expect(getByText('€15.99')).toBeTruthy();
    // Check that Pizza Palace appears in restaurant name
    expect(getByTestId('restaurant-name')).toBeTruthy();
  });

  it('should display savings percentage when original price is higher', () => {
    const { getByText } = render(<MealCard meal={mockMeal} />);

    expect(getByText('24% OFF')).toBeTruthy();
  });

  it('should not display savings when original price is not available', () => {
    const mealWithoutOriginalPrice = {
      ...mockMeal,
      original_price: null,
    };

    const { queryByText } = render(
      <MealCard meal={mealWithoutOriginalPrice} />
    );

    expect(queryByText('% OFF')).toBeNull();
  });

  it('should call onPress when card is pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <MealCard meal={mockMeal} onPress={mockOnPress} />
    );

    fireEvent.press(getByTestId('meal-card'));
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('should navigate to home when card is pressed without onPress prop', () => {
    const { getByTestId } = render(<MealCard meal={mockMeal} />);

    fireEvent.press(getByTestId('meal-card'));
    expect(router.push).toHaveBeenCalledWith('/');
  });

  it('should add meal to cart when Add to Cart button is pressed', () => {
    const { getByText } = render(<MealCard meal={mockMeal} />);

    fireEvent.press(getByText('Add to Cart'));
    expect(mockAddToCart).toHaveBeenCalledWith({
      id: mockMeal.id,
      name: mockMeal.title,
      price: mockMeal.current_price,
      image: mockMeal.image,
      restaurant: mockMeal.restaurant?.name,
    });
  });

  it('should show success animation when meal is added to cart', async () => {
    const { getByText, queryByText } = render(<MealCard meal={mockMeal} />);

    fireEvent.press(getByText('Add to Cart'));

    await waitFor(() => {
      expect(queryByText('Added!')).toBeTruthy();
    });
  });

  it('should toggle favorite when heart icon is pressed', async () => {
    const mockOnFavoriteToggle = jest.fn();
    const { getByTestId } = render(
      <MealCard meal={mockMeal} onFavoriteToggle={mockOnFavoriteToggle} />
    );

    fireEvent.press(getByTestId('favorite-button'));

    await waitFor(() => {
      expect(mealService.toggleFavorite).toHaveBeenCalledWith(1);
      expect(mockOnFavoriteToggle).toHaveBeenCalledWith(1, true);
    });
  });

  it('should handle favorite toggle error gracefully', async () => {
    (mealService.toggleFavorite as jest.Mock).mockRejectedValue(
      new Error('API Error')
    );

    const { getByTestId } = render(<MealCard meal={mockMeal} />);

    fireEvent.press(getByTestId('favorite-button'));

    // Should not throw error
    await waitFor(() => {
      expect(mealService.toggleFavorite).toHaveBeenCalledWith(1);
    });
  });

  it('should show correct favorite icon based on favorited state', () => {
    const { getByTestId } = render(
      <MealCard meal={mockMeal} isFavorited={true} />
    );

    // Should show filled heart when favorited
    expect(getByTestId('favorite-icon').props.name).toBe('heart');
  });

  it('should show outline heart when not favorited', () => {
    const { getByTestId } = render(
      <MealCard meal={mockMeal} isFavorited={false} />
    );

    // Should show outline heart when not favorited
    expect(getByTestId('favorite-icon').props.name).toBe('heart-outline');
  });

  it('should format pickup time correctly', () => {
    const { getByText } = render(<MealCard meal={mockMeal} />);

    // Should show pickup time range
    expect(getByText(/11:00 AM - 11:00 PM/)).toBeTruthy();
  });

  it('should handle missing pickup time gracefully', () => {
    const mealWithoutTime = {
      ...mockMeal,
      available_from: '',
      available_until: '',
    };

    const { queryByText } = render(<MealCard meal={mealWithoutTime} />);

    // Should not show pickup time
    expect(queryByText(/AM - PM/)).toBeNull();
  });

  it('should show loading state when toggling favorite', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    (mealService.toggleFavorite as jest.Mock).mockReturnValue(promise);

    const { getByTestId, queryByTestId } = render(<MealCard meal={mockMeal} />);

    fireEvent.press(getByTestId('favorite-button'));

    // Should show loading state
    await waitFor(() => {
      expect(getByTestId('favorite-loading')).toBeTruthy();
    });

    // Resolve the promise
    resolvePromise!({ is_favorited: true, meal_id: 1 });

    await waitFor(() => {
      expect(getByTestId('favorite-button')).toBeTruthy();
    });

  });

  it('should handle authentication requirement for favorites', () => {
    // Reset mocks
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });

    const { getByTestId } = render(<MealCard meal={mockMeal} />);

    fireEvent.press(getByTestId('favorite-button'));

    // Should call Alert.alert
    expect(mockAlert).toHaveBeenCalled();

    // Should navigate to login
    expect(router.push).toHaveBeenCalledWith('/(auth)/login');
  });

  it('should handle authentication requirement for adding to cart', () => {
    // Reset mocks
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });

    const { getByText } = render(<MealCard meal={mockMeal} />);

    fireEvent.press(getByText('Add to Cart'));

    // Should call Alert.alert
    expect(mockAlert).toHaveBeenCalled();

    // Should navigate to login
    expect(router.push).toHaveBeenCalledWith('/(auth)/login');
  });

  it('should display category information', () => {
    const { getByText } = render(<MealCard meal={mockMeal} />);

    expect(getByText('Italian')).toBeTruthy();
  });

  it('should handle missing category gracefully', () => {
    const mealWithoutCategory = {
      ...mockMeal,
      category: undefined,
    };

    const { queryByText } = render(<MealCard meal={mealWithoutCategory} />);

    expect(queryByText('Italian')).toBeNull();
  });

  it('should handle missing restaurant gracefully', () => {
    const mealWithoutRestaurant = {
      ...mockMeal,
      restaurant: undefined,
    };

    const { queryByText } = render(<MealCard meal={mealWithoutRestaurant} />);

    expect(queryByText('Pizza Palace')).toBeNull();
  });
});
