import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Mock all the dependencies first
jest.mock('../../lib/orders', () => ({
  getOrders: jest.fn(),
  cancelMyOrder: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
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
import OrdersScreen from '../../app/orders';
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
  data: [
    {
      id: 1,
      status: 'PENDING',
      total_amount: 15.50,
      created_at: '2024-01-15T10:30:00Z',
      payment_method: 'CASH_ON_PICKUP',
      items: [
        {
          id: 1,
          meal_id: 1,
          quantity: 2,
          price: 7.75,
          meal: {
            id: 1,
            title: 'Delicious Pasta',
            current_price: 7.75,
            image: 'https://example.com/pasta.jpg',
            restaurant: {
              name: 'Mama Mia Restaurant',
              address: '123 Main St, City',
              phone: '+1-555-0123',
            },
          },
        },
      ],
      events: [
        {
          id: 1,
          order_id: 1,
          event_type: 'ORDER_CREATED',
          description: 'Order placed successfully',
          created_at: '2024-01-15T10:30:00Z',
        },
      ],
    },
    {
      id: 2,
      status: 'ACCEPTED',
      total_amount: 22.00,
      created_at: '2024-01-15T09:15:00Z',
      payment_method: 'CASH_ON_PICKUP',
      items: [
        {
          id: 2,
          meal_id: 2,
          quantity: 1,
          price: 22.00,
          meal: {
            id: 2,
            title: 'Premium Burger',
            current_price: 22.00,
            image: 'https://example.com/burger.jpg',
            restaurant: {
              name: 'Burger Palace',
              address: '456 Oak Ave, City',
              phone: '+1-555-0456',
            },
          },
        },
      ],
      events: [
        {
          id: 2,
          order_id: 2,
          event_type: 'ORDER_CREATED',
          description: 'Order placed successfully',
          created_at: '2024-01-15T09:15:00Z',
        },
        {
          id: 3,
          order_id: 2,
          event_type: 'ORDER_ACCEPTED',
          description: 'Order accepted by restaurant',
          created_at: '2024-01-15T09:20:00Z',
        },
      ],
    },
  ],
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 2,
  },
};

describe('Enhanced Orders Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrderService.getOrders.mockResolvedValue(mockOrderData);
  });

  it('renders orders with enhanced details', async () => {
    render(
      <TestWrapper>
        <OrdersScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Order #1')).toBeTruthy();
      expect(screen.getByText('Order #2')).toBeTruthy();
    });

    // Check for enhanced order details
    expect(screen.getByText('Mama Mia Restaurant')).toBeTruthy();
    expect(screen.getByText('Burger Palace')).toBeTruthy();
  });

  it('displays restaurant information correctly', async () => {
    render(
      <TestWrapper>
        <OrdersScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Restaurant Information')).toBeTruthy();
    });

    // Check restaurant details
    expect(screen.getByText('📍 123 Main St, City')).toBeTruthy();
    expect(screen.getByText('📞 +1-555-0123')).toBeTruthy();
  });

  it('shows payment information correctly', async () => {
    render(
      <TestWrapper>
        <OrdersScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Payment Information')).toBeTruthy();
    });

    expect(screen.getByText('💵 Cash on Pickup')).toBeTruthy();
    expect(screen.getByText('€15.50')).toBeTruthy();
  });

  it('displays order timeline/events', async () => {
    render(
      <TestWrapper>
        <OrdersScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Order Timeline:')).toBeTruthy();
    });

    expect(screen.getByText('Order placed successfully')).toBeTruthy();
    expect(screen.getByText('Order accepted by restaurant')).toBeTruthy();
  });

  it('shows cancel button for PENDING orders', async () => {
    render(
      <TestWrapper>
        <OrdersScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Order #1')).toBeTruthy();
    });

    // Expand order details
    fireEvent.press(screen.getByText('Order #1'));

    await waitFor(() => {
      expect(screen.getByText('Cancel Order')).toBeTruthy();
    });
  });

  it('shows request cancellation button for ACCEPTED orders', async () => {
    render(
      <TestWrapper>
        <OrdersScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Order #2')).toBeTruthy();
    });

    // Expand order details
    fireEvent.press(screen.getByText('Order #2'));

    await waitFor(() => {
      expect(screen.getByText('Request Cancellation')).toBeTruthy();
    });
  });

  it('handles order cancellation for PENDING orders', async () => {
    mockOrderService.cancelMyOrder.mockResolvedValue({} as any);

    render(
      <TestWrapper>
        <OrdersScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Order #1')).toBeTruthy();
    });

    // Expand order details and click cancel
    fireEvent.press(screen.getByText('Order #1'));
    
    await waitFor(() => {
      expect(screen.getByText('Cancel Order')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Cancel Order'));

    // Should show confirmation alert
    expect(mockAlert).toHaveBeenCalledWith(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      expect.any(Array)
    );
  });

  it('handles request cancellation for ACCEPTED orders', async () => {
    mockOrderService.cancelMyOrder.mockResolvedValue({} as any);

    render(
      <TestWrapper>
        <OrdersScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Order #2')).toBeTruthy();
    });

    // Expand order details and click request cancellation
    fireEvent.press(screen.getByText('Order #2'));
    
    await waitFor(() => {
      expect(screen.getByText('Request Cancellation')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Request Cancellation'));

    // Should show confirmation alert with different message
    expect(mockAlert).toHaveBeenCalledWith(
      'Request Cancellation',
      'Your order has been accepted by the restaurant. You can request cancellation, but it may not be possible if preparation has started.',
      expect.any(Array)
    );
  });

  it('displays item details with proper pricing', async () => {
    render(
      <TestWrapper>
        <OrdersScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Order #1')).toBeTruthy();
    });

    // Expand order details
    fireEvent.press(screen.getByText('Order #1'));

    await waitFor(() => {
      expect(screen.getByText('Delicious Pasta')).toBeTruthy();
      expect(screen.getByText('€7.75 each')).toBeTruthy();
      expect(screen.getByText('€15.50')).toBeTruthy(); // Total for 2 items
    });
  });

  it('shows proper status indicators', async () => {
    render(
      <TestWrapper>
        <OrdersScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeTruthy();
      expect(screen.getByText('Accepted')).toBeTruthy();
    });
  });

  it('handles empty orders state', async () => {
    mockOrderService.getOrders.mockResolvedValue({
      data: [],
      pagination: { current_page: 1, last_page: 1, per_page: 20, total: 0 },
    });

    render(
      <TestWrapper>
        <OrdersScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No orders yet')).toBeTruthy();
      expect(screen.getByText('Start ordering delicious meals to see your order history here')).toBeTruthy();
    });
  });

  it('handles error state gracefully', async () => {
    mockOrderService.getOrders.mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <OrdersScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeTruthy();
      expect(screen.getByText('Network error')).toBeTruthy();
    });
  });
});
