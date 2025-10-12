import api from './api';
import { debug } from './debug';

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
  price: number | string;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number | string;
  status:
    | 'PENDING'
    | 'ACCEPTED'
    | 'READY_FOR_PICKUP'
    | 'COMPLETED'
    | 'CANCELLED_BY_CUSTOMER'
    | 'CANCELLED_BY_RESTAURANT'
    | 'EXPIRED';
  pickup_time?: string;
  pickup_window_start?: string;
  pickup_window_end?: string;
  notes?: string;
  payment_method?: 'CASH_ON_PICKUP' | 'ONLINE';
  pickup_code?: string;
  created_at: string;
  updated_at: string;
  accepted_at?: string;
  ready_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  expired_at?: string;
  cancel_reason?: string;
  cancelled_by?: 'customer' | 'restaurant' | 'system';
  items: OrderItem[];
  events?: OrderEvent[];
}

export interface OrderEvent {
  id: number;
  order_id: number;
  event_type: string;
  description: string;
  created_at: string;
  metadata?: any;
}

export interface CreateOrderData {
  items: Array<{
    meal_id: number;
    quantity: number;
  }>;
  pickup_time?: string;
  notes?: string;
  payment_method?: 'CASH_ON_PICKUP' | 'ONLINE';
}

export interface ApiResponse {
  status: boolean;
  message: string;
  data: Order | Order[];
  pagination?: any;
}

class OrderService {
  async getOrders(
    page: number = 1
  ): Promise<{ data: Order[]; pagination: any }> {
    try {
      debug.apiRequest('GET', `/me/orders?page=${page}`, null, { page });
      const response = await api.get(`/me/orders?page=${page}`);
      debug.apiResponse('GET', `/me/orders?page=${page}`, response.status, response.data, { page });
      
      // Handle paginated response structure from Laravel
      // Backend returns: { success: true, data: { data: [...], pagination: {...} } }
      const responseData = response.data?.data;
      const ordersData = responseData?.data || responseData || [];
      const paginationData = responseData?.pagination || null;
      
      // Ensure data is an array
      const ordersArray = Array.isArray(ordersData) ? ordersData : [];
      
      debug.info('Orders fetched successfully', { page, ordersCount: ordersArray.length }, {
        responseStructure: {
          hasData: !!response.data,
          hasDataData: !!response.data?.data,
          hasDataDataData: !!response.data?.data?.data,
          responseDataKeys: response.data?.data ? Object.keys(response.data.data) : [],
          ordersArrayLength: ordersArray.length,
        }
      });
      
      return {
        data: ordersArray,
        pagination: paginationData,
      };
    } catch (error: any) {
      debug.apiError('GET', `/me/orders?page=${page}`, error, { page });
      throw new Error(
        error.response?.data?.message || 'Failed to fetch orders'
      );
    }
  }

  async getOrder(id: number): Promise<Order> {
    try {
      const response = await api.get(`/orders/${id}/details`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  }

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const requestId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      debug.apiRequest('POST', '/orders', orderData, { requestId });
      
      const response = await api.post('/orders', orderData);
      
      debug.apiResponse('POST', '/orders', response.status, response.data, { requestId });
      
      const order = response.data.data;
      debug.orderCreated(order.id, order, { requestId });
      
      return order;
    } catch (error: any) {
      debug.apiError('POST', '/orders', error, { requestId });
      
      // Enhanced error handling for better user experience
      if (error.response?.status === 422) {
        // Validation errors
        const validationErrors = error.response.data?.errors;
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors)
            .flat()
            .join(', ');
          debug.error('Order validation failed', { requestId }, validationErrors);
          throw new Error(errorMessages);
        }
      } else if (error.response?.status === 400) {
        // Business logic errors (e.g., insufficient quantity)
        debug.error('Order business logic error', { requestId }, error.response.data);
        throw new Error(
          error.response.data?.message || 'Order creation failed'
        );
      }
      
      debug.error('Order creation failed', { requestId }, error);
      throw new Error(
        error.response?.data?.message || 'Failed to create order'
      );
    }
  }

  async cancelOrder(id: number): Promise<void> {
    try {
      await api.post(`/orders/${id}/cancel`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to cancel order'
      );
    }
  }

  async completeOrder(id: number): Promise<void> {
    try {
      await api.post(`/orders/${id}/complete`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to complete order'
      );
    }
  }

  /**
   * Cancel customer's own order
   */
  async cancelMyOrder(id: number): Promise<Order> {
    try {
      const response = await api.post(`/orders/${id}/cancel-my-order`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to cancel order'
      );
    }
  }

  /**
   * Get pickup code for an order
   */
  async getPickupCode(id: number): Promise<{ pickup_code: string }> {
    try {
      const response = await api.get(`/orders/${id}/show-code`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to get pickup code'
      );
    }
  }

  /**
   * Resend pickup code
   */
  async resendPickupCode(id: number): Promise<{ message: string }> {
    try {
      const response = await api.post(`/orders/${id}/resend-code`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to resend pickup code'
      );
    }
  }

  /**
   * Generate claim code for order pickup
   */
  async generateClaimCode(id: number): Promise<{ code: string; expires_at: string }> {
    try {
      const response = await api.post(`/orders/${id}/claim`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to generate claim code'
      );
    }
  }

  /**
   * Claim order (mark as completed by customer) - legacy method
   */
  async claimOrder(id: number): Promise<Order> {
    try {
      const response = await api.post(`/orders/${id}/claim`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to claim order'
      );
    }
  }
}

export default new OrderService();
