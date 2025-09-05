import mealService, { Meal, FilterOptions, MealFilters, ApiResponse } from '../../lib/meals';
import api from '../../lib/api';

// Mock the api module
jest.mock('../../lib/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('MealService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMeals', () => {
    it('should fetch meals with default parameters', async () => {
      const mockResponse: ApiResponse = {
        status: true,
        message: 'Meals fetched successfully',
        data: [
          {
            id: 1,
            title: 'Pizza',
            description: 'Delicious pizza',
            current_price: 15.99,
            original_price: 20.99,
            image: 'pizza.jpg',
            available_from: '2024-01-01T10:00:00Z',
            available_until: '2024-01-01T22:00:00Z',
            restaurant: { name: 'Pizza Place' },
            category: { id: 1, name: 'Italian' },
          },
        ],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 1,
          from: 1,
          to: 1,
          has_more_pages: false,
        },
        filters_applied: {},
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await mealService.getMeals();

      expect(api.get).toHaveBeenCalledWith('/meals?');
      expect(result).toEqual(mockResponse);
    });

    it('should fetch meals with filters', async () => {
      const mockResponse: ApiResponse = {
        status: true,
        message: 'Meals fetched successfully',
        data: [],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: 0,
          to: 0,
          has_more_pages: false,
        },
        filters_applied: {},
      };

      (api.get as jest.Mock).mockResolvedValue({ data: mockResponse });

      const filters: MealFilters = {
        page: 2,
        per_page: 20,
        search: 'pizza',
        category_id: 1,
        min_price: 10,
        max_price: 30,
        sort_by: 'price',
        sort_order: 'asc',
        available: true,
      };

      const result = await mealService.getMeals(filters);

      expect(api.get).toHaveBeenCalledWith(
        '/meals?page=2&per_page=20&search=pizza&category_id=1&min_price=10&max_price=30&sort_by=price&sort_order=asc&available=true'
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid response format', async () => {
      const invalidResponse = {
        status: true,
        message: 'Success',
        data: 'invalid', // Should be an array
      };

      (api.get as jest.Mock).mockResolvedValue({ data: invalidResponse });

      await expect(mealService.getMeals()).rejects.toThrow('Invalid response format from server');
    }, 15000);

    it('should retry on network errors', async () => {
      const mockResponse: ApiResponse = {
        status: true,
        message: 'Success',
        data: [],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: 0,
          to: 0,
          has_more_pages: false,
        },
        filters_applied: {},
      };

      (api.get as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({ data: mockResponse });

      const result = await mealService.getMeals();

      expect(api.get).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockResponse);
    });

    it('should not retry on authentication errors', async () => {
      const authError = {
        response: { status: 401 },
        message: 'Unauthorized',
      };

      (api.get as jest.Mock).mockRejectedValue(authError);

      await expect(mealService.getMeals()).rejects.toEqual(authError);
      expect(api.get).toHaveBeenCalledTimes(1);
    });

    it('should not retry on client errors', async () => {
      const clientError = {
        response: { status: 404 },
        message: 'Not found',
      };

      (api.get as jest.Mock).mockRejectedValue(clientError);

      await expect(mealService.getMeals()).rejects.toEqual(clientError);
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFilters', () => {
    it('should fetch filter options', async () => {
      const mockFilters: FilterOptions = {
        categories: [
          { id: 1, name: 'Italian' },
          { id: 2, name: 'American' },
        ],
        price_range: { min: 5, max: 50 },
        sort_options: [
          { value: 'price', label: 'Price' },
          { value: 'name', label: 'Name' },
        ],
        sort_orders: [
          { value: 'asc', label: 'Ascending' },
          { value: 'desc', label: 'Descending' },
        ],
      };

      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockFilters } });

      const result = await mealService.getFilters();

      expect(api.get).toHaveBeenCalledWith('/meals/filters');
      expect(result).toEqual(mockFilters);
    });
  });

  describe('getCategories', () => {
    it('should fetch categories', async () => {
      const mockCategories = [
        { id: 1, name: 'Italian' },
        { id: 2, name: 'American' },
        { id: 3, name: 'Asian' },
      ];

      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockCategories } });

      const result = await mealService.getCategories();

      expect(api.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getMeal', () => {
    it('should fetch a single meal by ID', async () => {
      const mockMeal: Meal = {
        id: 1,
        title: 'Pizza',
        description: 'Delicious pizza',
        current_price: 15.99,
        original_price: 20.99,
        image: 'pizza.jpg',
        available_from: '2024-01-01T10:00:00Z',
        available_until: '2024-01-01T22:00:00Z',
        restaurant: { name: 'Pizza Place' },
        category: { id: 1, name: 'Italian' },
      };

      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockMeal } });

      const result = await mealService.getMeal(1);

      expect(api.get).toHaveBeenCalledWith('/meals/1');
      expect(result).toEqual(mockMeal);
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status for a meal', async () => {
      const mockResponse = {
        is_favorited: true,
        meal_id: 1,
      };

      (api.post as jest.Mock).mockResolvedValue({ data: { data: mockResponse } });

      const result = await mealService.toggleFavorite(1);

      expect(api.post).toHaveBeenCalledWith('/meals/1/favorite');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getFavorites', () => {
    it('should fetch user favorites', async () => {
      const mockFavorites: Meal[] = [
        {
          id: 1,
          title: 'Pizza',
          description: 'Delicious pizza',
          current_price: 15.99,
          original_price: 20.99,
          image: 'pizza.jpg',
          available_from: '2024-01-01T10:00:00Z',
          available_until: '2024-01-01T22:00:00Z',
          restaurant: { name: 'Pizza Place' },
          category: { id: 1, name: 'Italian' },
        },
      ];

      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockFavorites } });

      const result = await mealService.getFavorites();

      expect(api.get).toHaveBeenCalledWith('/meals/favorites');
      expect(result).toEqual(mockFavorites);
    });
  });

  describe('retryRequest', () => {
    it('should handle exponential backoff correctly', async () => {
      const mockResponse: ApiResponse = {
        status: true,
        message: 'Success',
        data: [],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 0,
          from: 0,
          to: 0,
          has_more_pages: false,
        },
        filters_applied: {},
      };

      (api.get as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({ data: mockResponse });

      const result = await mealService.getMeals();

      expect(api.get).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockResponse);
    }, 15000);
  });
});