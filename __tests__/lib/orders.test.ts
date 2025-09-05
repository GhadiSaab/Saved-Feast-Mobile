import orderService, { Order, CreateOrderData, OrderItem } from '../../lib/orders';
import api from '../../lib/api';

// Mock the api module
jest.mock('../../lib/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should fetch orders with default page', async () => {
      const mockOrders: Order[] = [
        {
          id: 1,
          user_id: 1,
          total_amount: 25.98,
          status: 'pending',
          pickup_time: '2024-01-01T12:00:00Z',
          notes: 'Extra sauce',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: [
            {
              id: 1,
              meal_id: 1,
              meal: {
                id: 1,
                title: 'Pizza',
                current_price: 15.99,
                image: 'pizza.jpg',
                restaurant: { name: 'Pizza Place' },
              },
              quantity: 1,
              price: 15.99,
            },
          ],
        },
      ];

      const mockResponse = {
        data: mockOrders,
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 1,
        },
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await orderService.getOrders();

      expect(api.get).toHaveBeenCalledWith('/orders?page=1');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch orders with specific page', async () => {
      const mockResponse = {
        data: [],
        pagination: {
          current_page: 2,
          last_page: 2,
          per_page: 10,
          total: 0,
        },
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await orderService.getOrders(2);

      expect(api.get).toHaveBeenCalledWith('/orders?page=2');
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'Unauthorized access',
          },
        },
      };

      (api.get as jest.Mock).mockRejectedValue(errorResponse);

      await expect(orderService.getOrders()).rejects.toThrow('Unauthorized access');
    });

    it('should handle API errors without message', async () => {
      const errorResponse = {
        response: {
          data: {},
        },
      };

      (api.get as jest.Mock).mockRejectedValue(errorResponse);

      await expect(orderService.getOrders()).rejects.toThrow('Failed to fetch orders');
    });
  });

  describe('getOrder', () => {
    it('should fetch a single order by ID', async () => {
      const mockOrder: Order = {
        id: 1,
        user_id: 1,
        total_amount: 25.98,
        status: 'pending',
        pickup_time: '2024-01-01T12:00:00Z',
        notes: 'Extra sauce',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        items: [
          {
            id: 1,
            meal_id: 1,
            meal: {
              id: 1,
              title: 'Pizza',
              current_price: 15.99,
              image: 'pizza.jpg',
              restaurant: { name: 'Pizza Place' },
            },
            quantity: 1,
            price: 15.99,
          },
        ],
      };

      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockOrder } });

      const result = await orderService.getOrder(1);

      expect(api.get).toHaveBeenCalledWith('/orders/1');
      expect(result).toEqual(mockOrder);
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'Order not found',
          },
        },
      };

      (api.get as jest.Mock).mockRejectedValue(errorResponse);

      await expect(orderService.getOrder(999)).rejects.toThrow('Order not found');
    });
  });

  describe('createOrder', () => {
    it('should create a new order successfully', async () => {
      const orderData: CreateOrderData = {
        items: [
          { meal_id: 1, quantity: 2 },
          { meal_id: 2, quantity: 1 },
        ],
        pickup_time: '2024-01-01T12:00:00Z',
        notes: 'Extra sauce please',
      };

      const mockOrder: Order = {
        id: 1,
        user_id: 1,
        total_amount: 44.97,
        status: 'pending',
        pickup_time: '2024-01-01T12:00:00Z',
        notes: 'Extra sauce please',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        items: [
          {
            id: 1,
            meal_id: 1,
            meal: {
              id: 1,
              title: 'Pizza',
              current_price: 15.99,
              image: 'pizza.jpg',
              restaurant: { name: 'Pizza Place' },
            },
            quantity: 2,
            price: 15.99,
          },
          {
            id: 2,
            meal_id: 2,
            meal: {
              id: 2,
              title: 'Burger',
              current_price: 12.99,
              image: 'burger.jpg',
              restaurant: { name: 'Burger Joint' },
            },
            quantity: 1,
            price: 12.99,
          },
        ],
      };

      (api.post as jest.Mock).mockResolvedValue({ data: { data: mockOrder } });

      const result = await orderService.createOrder(orderData);

      expect(api.post).toHaveBeenCalledWith('/orders', orderData);
      expect(result).toEqual(mockOrder);
    });

    it('should handle validation errors (422)', async () => {
      const orderData: CreateOrderData = {
        items: [],
      };

      const errorResponse = {
        response: {
          status: 422,
          data: {
            errors: {
              items: ['Items are required'],
              pickup_time: ['Pickup time is required'],
            },
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(errorResponse);

      await expect(orderService.createOrder(orderData)).rejects.toThrow(
        'Items are required, Pickup time is required'
      );
    });

    it('should handle business logic errors (400)', async () => {
      const orderData: CreateOrderData = {
        items: [{ meal_id: 1, quantity: 100 }], // Too many items
      };

      const errorResponse = {
        response: {
          status: 400,
          data: {
            message: 'Insufficient quantity available',
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(errorResponse);

      await expect(orderService.createOrder(orderData)).rejects.toThrow(
        'Insufficient quantity available'
      );
    });

    it('should handle general API errors', async () => {
      const orderData: CreateOrderData = {
        items: [{ meal_id: 1, quantity: 1 }],
      };

      const errorResponse = {
        response: {
          status: 500,
          data: {
            message: 'Internal server error',
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(errorResponse);

      await expect(orderService.createOrder(orderData)).rejects.toThrow(
        'Internal server error'
      );
    });

    it('should handle API errors without message', async () => {
      const orderData: CreateOrderData = {
        items: [{ meal_id: 1, quantity: 1 }],
      };

      const errorResponse = {
        response: {
          data: {},
        },
      };

      (api.post as jest.Mock).mockRejectedValue(errorResponse);

      await expect(orderService.createOrder(orderData)).rejects.toThrow(
        'Failed to create order'
      );
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order successfully', async () => {
      (api.post as jest.Mock).mockResolvedValue({ data: { message: 'Order cancelled' } });

      await orderService.cancelOrder(1);

      expect(api.post).toHaveBeenCalledWith('/orders/1/cancel');
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'Cannot cancel order',
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(errorResponse);

      await expect(orderService.cancelOrder(1)).rejects.toThrow('Cannot cancel order');
    });

    it('should handle API errors without message', async () => {
      const errorResponse = {
        response: {
          data: {},
        },
      };

      (api.post as jest.Mock).mockRejectedValue(errorResponse);

      await expect(orderService.cancelOrder(1)).rejects.toThrow('Failed to cancel order');
    });
  });

  describe('completeOrder', () => {
    it('should complete an order successfully', async () => {
      (api.post as jest.Mock).mockResolvedValue({ data: { message: 'Order completed' } });

      await orderService.completeOrder(1);

      expect(api.post).toHaveBeenCalledWith('/orders/1/complete');
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'Cannot complete order',
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(errorResponse);

      await expect(orderService.completeOrder(1)).rejects.toThrow('Cannot complete order');
    });

    it('should handle API errors without message', async () => {
      const errorResponse = {
        response: {
          data: {},
        },
      };

      (api.post as jest.Mock).mockRejectedValue(errorResponse);

      await expect(orderService.completeOrder(1)).rejects.toThrow('Failed to complete order');
    });
  });
});
