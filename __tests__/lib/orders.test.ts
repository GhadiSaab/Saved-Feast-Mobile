import orderService from '@/lib/orders';
import api from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

// Mock the debug module
jest.mock('@/lib/debug', () => ({
  debug: {
    apiRequest: jest.fn(),
    apiResponse: jest.fn(),
    apiError: jest.fn(),
    info: jest.fn(),
  },
}));

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrders', () => {
    it('should handle paginated response structure correctly', async () => {
      // Mock the API response with Laravel pagination structure
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

      const mockPagination = {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 1,
      };

      const mockResponse = {
        data: {
          success: true,
          data: {
            data: mockOrders,
            pagination: mockPagination,
          },
        },
        status: 200,
      };

      mockedApi.get.mockResolvedValueOnce(mockResponse);

      const result = await orderService.getOrders(1);

      expect(mockedApi.get).toHaveBeenCalledWith('/me/orders?page=1');
      expect(result.data).toEqual(mockOrders);
      expect(result.pagination).toEqual(mockPagination);
    });

    it('should handle empty orders response', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            data: [],
            pagination: {
              current_page: 1,
              last_page: 1,
              per_page: 15,
              total: 0,
            },
          },
        },
        status: 200,
      };

      mockedApi.get.mockResolvedValueOnce(mockResponse);

      const result = await orderService.getOrders(1);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle API errors gracefully', async () => {
      const mockError = {
        response: {
          status: 500,
          data: {
            message: 'Internal server error',
          },
        },
      };

      mockedApi.get.mockRejectedValueOnce(mockError);

      await expect(orderService.getOrders(1)).rejects.toThrow('Internal server error');
    });

    it('should handle network errors', async () => {
      const mockError = {
        message: 'Network Error',
        code: 'NETWORK_ERROR',
      };

      mockedApi.get.mockRejectedValueOnce(mockError);

      await expect(orderService.getOrders(1)).rejects.toThrow('Failed to fetch orders');
    });
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const orderData = {
        items: [
          {
            meal_id: 1,
            quantity: 2,
          },
        ],
        notes: 'Test order',
        payment_method: 'CASH_ON_PICKUP' as const,
      };

      const mockOrder = {
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
            },
          },
        ],
      };

      const mockResponse = {
        data: {
          status: true,
          message: 'Order created successfully',
          data: mockOrder,
        },
        status: 201,
      };

      mockedApi.post.mockResolvedValueOnce(mockResponse);

      const result = await orderService.createOrder(orderData);

      expect(mockedApi.post).toHaveBeenCalledWith('/orders', orderData);
      expect(result).toEqual(mockOrder);
    });

    it('should handle validation errors', async () => {
      const orderData = {
        items: [],
        notes: 'Test order',
        payment_method: 'CASH_ON_PICKUP' as const,
      };

      const mockError = {
        response: {
          status: 422,
          data: {
            message: 'Validation failed',
            errors: {
              items: ['The items field is required.'],
            },
          },
        },
      };

      mockedApi.post.mockRejectedValueOnce(mockError);

      await expect(orderService.createOrder(orderData)).rejects.toThrow('The items field is required.');
    });
  });
});