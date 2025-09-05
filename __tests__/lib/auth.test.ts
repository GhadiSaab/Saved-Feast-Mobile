import authService, { User, LoginCredentials, RegisterData, AuthResponse } from '../../lib/auth';
import api from '../../lib/api';
import * as SecureStore from 'expo-secure-store';

// Mock the api module
jest.mock('../../lib/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse: AuthResponse = {
        user: {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'test@example.com',
          phone: '+1234567890',
          address: '123 Main St',
        },
        token: 'mock-jwt-token',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: {
          user: mockResponse.user,
          access_token: mockResponse.token,
        },
      });

      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/login', credentials);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', mockResponse.token);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('user_data', JSON.stringify(mockResponse.user));
      expect(result).toEqual(mockResponse);
    });

    it('should retry on network errors', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse: AuthResponse = {
        user: {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'test@example.com',
        },
        token: 'mock-jwt-token',
      };

      (api.post as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({
          data: {
            user: mockResponse.user,
            access_token: mockResponse.token,
          },
        });

      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponse);
    });

    it('should not retry on authentication errors', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const authError = {
        response: { status: 401 },
        message: 'Invalid credentials',
      };

      (api.post as jest.Mock).mockRejectedValue(authError);

      await expect(authService.login(credentials)).rejects.toEqual(authError);
      expect(api.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('register', () => {
    it('should register successfully and store token', async () => {
      const userData: RegisterData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        phone: '+1234567890',
        address: '123 Main St',
      };

      const mockResponse: AuthResponse = {
        user: {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'test@example.com',
          phone: '+1234567890',
          address: '123 Main St',
        },
        token: 'mock-jwt-token',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: {
          user: mockResponse.user,
          access_token: mockResponse.token,
        },
      });

      const result = await authService.register(userData);

      expect(api.post).toHaveBeenCalledWith('/register', userData);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('auth_token', mockResponse.token);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('user_data', JSON.stringify(mockResponse.user));
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear storage', async () => {
      (api.post as jest.Mock).mockResolvedValue({ data: { message: 'Logged out' } });

      await authService.logout();

      expect(api.post).toHaveBeenCalledWith('/logout');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('user_data');
    });

    it('should clear storage even if API call fails', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await authService.logout();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('user_data');
    });

    it('should handle logout timeout', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Logout timeout'));

      await authService.logout();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('user_data');
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return fresh user data from API', async () => {
      const mockUser: User = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
      };

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('mock-token') // For auth_token
        .mockResolvedValueOnce(JSON.stringify(mockUser)); // For user_data

      (api.get as jest.Mock).mockResolvedValue({ data: mockUser });

      const result = await authService.getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/user');
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('user_data', JSON.stringify(mockUser));
      expect(result).toEqual(mockUser);
    });

    it('should return cached data on network error', async () => {
      const mockUser: User = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
      };

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('mock-token') // For auth_token
        .mockResolvedValueOnce(JSON.stringify(mockUser)); // For user_data

      (api.get as jest.Mock).mockRejectedValue(new Error('Network error occurred'));

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should clear storage on 401 error', async () => {
      const mockUser: User = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
      };

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('mock-token') // For auth_token
        .mockResolvedValueOnce(JSON.stringify(mockUser)); // For user_data

      (api.get as jest.Mock).mockRejectedValue({
        response: { status: 401 },
        message: 'Unauthorized',
      });

      const result = await authService.getCurrentUser();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('user_data');
      expect(result).toBeNull();
    });

    it('should handle API timeout', async () => {
      const mockUser: User = {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
      };

      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce('mock-token') // For auth_token
        .mockResolvedValueOnce(JSON.stringify(mockUser)); // For user_data

      (api.get as jest.Mock).mockRejectedValue(new Error('API timeout'));

      const result = await authService.getCurrentUser();

      expect(result).toEqual(mockUser); // Should return cached data
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('mock-token');

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no token exists', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockClear();
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const profileData: Partial<User> = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
      };

      const updatedUser: User = {
        id: 1,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: { user: updatedUser },
      });

      const result = await authService.updateProfile(profileData);

      expect(api.post).toHaveBeenCalledWith('/user/profile', {
        name: 'Jane Smith',
        email: 'jane@example.com',
      });
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('user_data', JSON.stringify(updatedUser));
      expect(result).toEqual(updatedUser);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const passwordData = {
        current_password: 'oldpassword',
        password: 'newpassword',
        password_confirmation: 'newpassword',
      };

      (api.post as jest.Mock).mockResolvedValue({ data: { message: 'Password changed' } });

      await authService.changePassword(passwordData);

      expect(api.post).toHaveBeenCalledWith('/user/change-password', passwordData);
    });
  });

  describe('testConnection', () => {
    it('should return true on successful connection', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { message: 'API is working' } });

      const result = await authService.testConnection();

      expect(api.get).toHaveBeenCalledWith('/');
      expect(result).toBe(true);
    });

    it('should return false on connection failure', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await authService.testConnection();

      expect(result).toBe(false);
    });

    it('should handle connection timeout', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Connection timeout'));

      const result = await authService.testConnection();

      expect(result).toBe(false);
    });
  });
});
