import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from 'expo-router';
import CheckoutScreen from '@/app/checkout';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import orderService from '@/lib/orders';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock the order service
jest.mock('@/lib/orders');
const mockedOrderService = orderService as jest.Mocked<typeof orderService>;

// Mock the debug module
jest.mock('@/lib/debug', () => ({
  debug: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock user data
const mockUser = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  address: '123 Test St',
};

// Mock cart items
const mockCartItems = [
  {
    id: 1,
    name: 'Test Meal',
    price: 10.50,
    quantity: 2,
    image: 'test.jpg',
    restaurant: 'Test Restaurant',
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
      <AuthProvider>
        <CartProvider>
          {component}
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Order Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create order and redirect to confirmation page', async () => {
    const mockOrder = {
      id: 1,
      user_id: 1,
      total_amount: 21.00,
      status: 'PENDING',
      created_at: '2024-01-01T10:00:00Z',
      items: [
        {
          id: 1,
          meal_id: 1,
          quantity: 2,
          price: 10.50,
          meal: {
            id: 1,
            title: 'Test Meal',
            current_price: 10.50,
          },
        },
      ],
    };

    mockedOrderService.createOrder.mockResolvedValueOnce(mockOrder);

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <CheckoutScreen />
    );

    // Add some notes
    const notesInput = getByPlaceholderText('Any special instructions or requests...');
    fireEvent.changeText(notesInput, 'Please make it spicy');

    // Place the order
    const placeOrderButton = getByText('Place Order');
    fireEvent.press(placeOrderButton);

    // Wait for the order to be created
    await waitFor(() => {
      expect(mockedOrderService.createOrder).toHaveBeenCalledWith({
        items: [
          {
            meal_id: 1,
            quantity: 2,
          },
        ],
        notes: 'Please make it spicy',
        payment_method: 'CASH_ON_PICKUP',
      });
    });

    // Check that we're redirected to the confirmation page
    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/order-confirmation?orderId=1');
    });
  });

  it('should handle order creation failure', async () => {
    const mockError = new Error('Order creation failed');
    mockedOrderService.createOrder.mockRejectedValueOnce(mockError);

    const { getByText } = renderWithProviders(<CheckoutScreen />);

    const placeOrderButton = getByText('Place Order');
    fireEvent.press(placeOrderButton);

    // Wait for the error to be handled
    await waitFor(() => {
      expect(mockedOrderService.createOrder).toHaveBeenCalled();
    });

    // The error should be logged but not crash the app
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('should show loading state while placing order', async () => {
    // Create a promise that we can control
    let resolveOrder: (value: any) => void;
    const orderPromise = new Promise((resolve) => {
      resolveOrder = resolve;
    });

    mockedOrderService.createOrder.mockReturnValueOnce(orderPromise);

    const { getByText } = renderWithProviders(<CheckoutScreen />);

    const placeOrderButton = getByText('Place Order');
    fireEvent.press(placeOrderButton);

    // Should show loading state
    expect(getByText('Placing Order...')).toBeTruthy();

    // Resolve the order
    resolveOrder!({
      id: 1,
      user_id: 1,
      total_amount: 21.00,
      status: 'PENDING',
      created_at: '2024-01-01T10:00:00Z',
      items: [],
    });

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalled();
    });
  });
});