import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock all the dependencies first
jest.mock('../../lib/orders', () => ({
  getOrder: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: () => ({ orderId: '123' }),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
  };
});

// Import after mocking
import OrderConfirmationScreen from '../../app/order-confirmation';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import { NotificationProvider } from '../../context/NotificationContext';
import orderService from '../../lib/orders';

const mockOrderService = orderService as jest.Mocked<typeof orderService>;

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};

const mockOrderData = {
  id: 123,
  status: 'PENDING',
  total_amount: 25.50,
  created_at: '2024-01-15T10:30:00Z',
  payment_method: 'CASH_ON_PICKUP',
  pickup_time: '2024-01-15T12:00:00Z',
  items: [
    {
      id: 1,
      meal_id: 1,
      quantity: 2,
      price: 12.75,
      meal: {
        id: 1,
        title: 'Delicious Pasta',
        current_price: 12.75,
        image: 'https://example.com/pasta.jpg',
        restaurant: {
          name: 'Mama Mia Restaurant',
        },
      },
    },
  ],
  events: [
    {
      id: 1,
      order_id: 123,
      event_type: 'ORDER_CREATED',
      description: 'Order placed successfully',
      created_at: '2024-01-15T10:30:00Z',
    },
  ],
};

describe('Enhanced Order Confirmation Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrderService.getOrder.mockResolvedValue(mockOrderData);
  });

  it('renders order confirmation with enhanced details', async () => {
    render(
      <TestWrapper>
        <OrderConfirmationScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Order Confirmed!')).toBeTruthy();
      expect(screen.getByText('Your order has been successfully placed')).toBeTruthy();
    });

    // Check for enhanced order details
    expect(screen.getByText('Order ID:')).toBeTruthy();
    expect(screen.getByText('#123')).toBeTruthy();
    expect(screen.getByText('Status:')).toBeTruthy();
    expect(screen.getByText('Pending')).toBeTruthy();
    expect(screen.getByText('Payment Method:')).toBeTruthy();
    expect(screen.getByText('💵 Cash on Pickup')).toBeTruthy();
  });

  it('displays order status with proper styling', async () => {
    render(
      <TestWrapper>
        <OrderConfirmationScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeTruthy();
    });

    // Status should be displayed with proper formatting
    const statusElement = screen.getByText('Pending');
    expect(statusElement).toBeTruthy();
  });

  it('shows payment method information', async () => {
    render(
      <TestWrapper>
        <OrderConfirmationScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('💵 Cash on Pickup')).toBeTruthy();
    });
  });

  it('displays order items with quantities and prices', async () => {
    render(
      <TestWrapper>
        <OrderConfirmationScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Items Ordered:')).toBeTruthy();
    });

    expect(screen.getByText('Delicious Pasta')).toBeTruthy();
    expect(screen.getByText('x2')).toBeTruthy();
    expect(screen.getByText('€25.50')).toBeTruthy(); // Total for 2 items
  });

  it('shows what happens next steps', async () => {
    render(
      <TestWrapper>
        <OrderConfirmationScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('What Happens Next?')).toBeTruthy();
    });

    expect(screen.getByText('Restaurant Notification')).toBeTruthy();
    expect(screen.getByText('Meal Preparation')).toBeTruthy();
    expect(screen.getByText('Ready for Pickup')).toBeTruthy();
  });

  it('displays action buttons correctly', async () => {
    render(
      <TestWrapper>
        <OrderConfirmationScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Track Order')).toBeTruthy();
      expect(screen.getByText('View All Orders')).toBeTruthy();
      expect(screen.getByText('Back to Feed')).toBeTruthy();
    });
  });

  it('handles loading state', async () => {
    mockOrderService.getOrder.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <TestWrapper>
        <OrderConfirmationScreen />
      </TestWrapper>
    );

    expect(screen.getByText('Loading order details...')).toBeTruthy();
  });

  it('handles order not found error', async () => {
    mockOrderService.getOrder.mockRejectedValue(new Error('Order not found'));

    render(
      <TestWrapper>
        <OrderConfirmationScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Order Not Found')).toBeTruthy();
      expect(screen.getByText("We couldn't find the order details. Please check your order history.")).toBeTruthy();
    });
  });

  it('handles different order statuses', async () => {
    const acceptedOrder = { ...mockOrderData, status: 'ACCEPTED' };
    mockOrderService.getOrder.mockResolvedValue(acceptedOrder);

    render(
      <TestWrapper>
        <OrderConfirmationScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Accepted')).toBeTruthy();
    });
  });

  it('formats pickup time correctly', async () => {
    render(
      <TestWrapper>
        <OrderConfirmationScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Pickup Time:')).toBeTruthy();
      // Should show formatted time (12:00 PM or similar)
      expect(screen.getByText(/12:00/)).toBeTruthy();
    });
  });

  it('shows total amount with proper formatting', async () => {
    render(
      <TestWrapper>
        <OrderConfirmationScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Total Amount:')).toBeTruthy();
      expect(screen.getByText('€25.50')).toBeTruthy();
    });
  });
});
