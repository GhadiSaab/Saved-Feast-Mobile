import api from './api';

export interface OrderItem {
  id: number;
  meal_id: number;
  meal: {
    id: number;
    title: string;
    current_price: number;
    image?: string;
    restaurant?: {
      name: string;
    };
  };
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  pickup_time: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface CreateOrderData {
  items: Array<{
    meal_id: number;
    quantity: number;
  }>;
  pickup_time?: string;
  notes?: string;
}

export interface ApiResponse {
  status: boolean;
  message: string;
  data: Order | Order[];
  pagination?: any;
}

class OrderService {
  async getOrders(page: number = 1): Promise<{ data: Order[]; pagination: any }> {
    try {
      const response = await api.get(`/orders?page=${page}`);
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  }

  async getOrder(id: number): Promise<Order> {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  }

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const response = await api.post('/orders', orderData);
      return response.data.data;
    } catch (error: any) {
      // Enhanced error handling for better user experience
      if (error.response?.status === 422) {
        // Validation errors
        const validationErrors = error.response.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat().join(', ');
          throw new Error(errorMessages);
        }
      } else if (error.response?.status === 400) {
        // Business logic errors (e.g., insufficient quantity)
        throw new Error(error.response.data?.message || 'Order creation failed');
      }
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  }

  async cancelOrder(id: number): Promise<void> {
    try {
      await api.post(`/orders/${id}/cancel`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  }

  async completeOrder(id: number): Promise<void> {
    try {
      await api.post(`/orders/${id}/complete`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to complete order');
    }
  }
}

export default new OrderService();
