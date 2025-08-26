import api from './api';

export interface Meal {
  id: number;
  title: string;
  description: string;
  current_price: number;
  original_price?: number | null;
  image?: string | null;
  available_from: string;
  available_until: string;
  restaurant?: {
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  has_more_pages: boolean;
}

export interface ApiResponse {
  status: boolean;
  message: string;
  data: Meal[];
  pagination: PaginationInfo;
  filters_applied: any;
}

export interface FilterOptions {
  categories: Array<{ id: number; name: string }>;
  price_range: { min: number; max: number };
  sort_options: Array<{ value: string; label: string }>;
  sort_orders: Array<{ value: string; label: string }>;
}

export interface MealFilters {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_order?: string;
  available?: boolean;
}

class MealService {
  private async retryRequest<T>(requestFn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxRetries} for API request`);
        return await requestFn();
      } catch (error: any) {
        lastError = error;
        console.log(`Attempt ${attempt} failed:`, error.message);
        
        // Don't retry on authentication errors or client errors
        if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff with longer delays)
        if (attempt < maxRetries) {
          const delay = Math.min(Math.pow(2, attempt) * 2000, 10000); // Max 10 seconds delay
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error('All retry attempts failed:', lastError);
    throw lastError;
  }

  async getMeals(filters: MealFilters = {}): Promise<ApiResponse> {
    return this.retryRequest(async () => {
      const params = new URLSearchParams();
      
      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      console.log('Fetching meals with params:', params.toString());
      const response = await api.get(`/meals?${params.toString()}`);
      
      console.log('Meals response received successfully');
      
      // Validate response structure
      if (!response.data || !Array.isArray(response.data.data)) {
        console.error('Invalid meals response format:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      return response.data;
    });
  }

  async getFilters(): Promise<FilterOptions> {
    return this.retryRequest(async () => {
      const response = await api.get('/meals/filters');
      return response.data.data;
    });
  }

  async getCategories(): Promise<Array<{ id: number; name: string }>> {
    return this.retryRequest(async () => {
      const response = await api.get('/categories');
      return response.data.data;
    });
  }

  async getMeal(id: number): Promise<Meal> {
    return this.retryRequest(async () => {
      const response = await api.get(`/meals/${id}`);
      return response.data.data;
    });
  }

  async toggleFavorite(mealId: number): Promise<{ is_favorited: boolean; meal_id: number }> {
    return this.retryRequest(async () => {
      const response = await api.post(`/meals/${mealId}/favorite`);
      return response.data.data;
    });
  }

  async getFavorites(): Promise<Meal[]> {
    return this.retryRequest(async () => {
      const response = await api.get('/meals/favorites');
      return response.data.data;
    });
  }
}

export default new MealService();
