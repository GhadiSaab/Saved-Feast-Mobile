import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OrdersScreen from '@/app/orders';
import orderService from '@/lib/orders';

// Mock the order service
jest.mock('@/lib/orders');
const mockedOrderService = orderService as jest.Mocked<typeof orderService>;

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

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
      {component}
    </QueryClientProvider>
  );
};

describe('OrdersScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display orders when available', async () => {
    const mockOrders = [
      {
        id: 1,
        user_id: 1,
        total_amount: 15.50,
        status: 'PENDING',
        created_at: '2024-01-01T10:00:00Z',
        items: [
          {
            id: 1,
            meal_id: 1,
            quantity: 2,
            price: 7.75,
            meal: {
              id: 1,
              title: 'Test Meal',
              current_price: 7.75,
              image: 'test.jpg',
              restaurant: {
                name: 'Test Restaurant',
              },
            },
          },
        ],
      },
    ];

    mockedOrderService.getOrders.mockResolvedValueOnce({
      data: mockOrders,
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 1,
      },
    });

    const { getByText } = renderWithProviders(<OrdersScreen />);

    await waitFor(() => {
      expect(getByText('Order #1')).toBeTruthy();
      expect(getByText('€15.50')).toBeTruthy();
      expect(getByText('Pending')).toBeTruthy();
    });
  });

  it('should display empty state when no orders', async () => {
    mockedOrderService.getOrders.mockResolvedValueOnce({
      data: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
      },
    });

    const { getByText } = renderWithProviders(<OrdersScreen />);

    await waitFor(() => {
      expect(getByText('No orders yet')).toBeTruthy();
      expect(getByText('Start ordering delicious meals to see your order history here')).toBeTruthy();
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockError = new Error('Failed to fetch orders');
    mockedOrderService.getOrders.mockRejectedValueOnce(mockError);

    const { getByText } = renderWithProviders(<OrdersScreen />);

    await waitFor(() => {
      expect(getByText('Something went wrong')).toBeTruthy();
      expect(getByText('Failed to fetch orders')).toBeTruthy();
    });
  });
});



