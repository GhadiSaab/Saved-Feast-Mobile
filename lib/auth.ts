import api from './api';
import { storage } from './storage';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  roles?: Array<{
    id: number;
    name: string;
    description: string;
  }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Auth attempt ${attempt}/${maxRetries}`);
        return await requestFn();
      } catch (error: any) {
        lastError = error;
        console.log(`Auth attempt ${attempt} failed:`, error.message);

        // Don't retry on authentication errors or client errors
        if (
          error.response?.status === 401 ||
          error.response?.status === 403 ||
          error.response?.status === 404
        ) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.min(Math.pow(2, attempt) * 2000, 10000); // Max 10 seconds delay
          console.log(`Auth waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error('All auth retry attempts failed:', lastError);
    throw lastError;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.retryRequest(async () => {
      const response = await api.post('/login', credentials);
      const { user, access_token } = response.data;

      // Store token and user data securely
      await storage.setItemAsync('auth_token', access_token);
      await storage.setItemAsync('user_data', JSON.stringify(user));

      return { user, token: access_token };
    });
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    return this.retryRequest(async () => {
      const response = await api.post('/register', userData);
      const { user, access_token } = response.data;

      // Store token and user data securely
      await storage.setItemAsync('auth_token', access_token);
      await storage.setItemAsync('user_data', JSON.stringify(user));

      return { user, token: access_token };
    });
  }

  async logout(): Promise<void> {
    try {
      // Try to call logout API with a timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Logout timeout')), 5000)
      );

      await Promise.race([api.post('/logout'), timeoutPromise]);
    } catch (error) {
      // Even if logout API fails, clear local storage
      console.warn('Logout API failed, but clearing local storage:', error);
    } finally {
      // Clear local storage
      await storage.deleteItemAsync('auth_token');
      await storage.deleteItemAsync('user_data');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await storage.getItemAsync('auth_token');
      console.log('getCurrentUser - token exists:', !!token);

      if (!token) {
        return null;
      }

      // Try to get fresh user data from API with timeout
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('API timeout')), 10000)
        );

        const apiPromise = api.get('/user');
        const response = (await Promise.race([
          apiPromise,
          timeoutPromise,
        ])) as any;
        const user = response.data;

        console.log('getCurrentUser - API response received');

        // Update stored user data
        await storage.setItemAsync('user_data', JSON.stringify(user));

        return user;
      } catch (apiError: any) {
        console.error('API error getting current user:', apiError);

        // If API call fails, try to get cached user data
        try {
          const userData = await storage.getItemAsync('user_data');
          if (userData) {
            const cachedUser = JSON.parse(userData);
            console.log('getCurrentUser - using cached data:', !!cachedUser);

            // If it's a network error, return cached data
            if (
              apiError.message.includes('Network error') ||
              apiError.message.includes('timeout')
            ) {
              return cachedUser;
            }

            // If it's an auth error (401), clear everything
            if (apiError.response?.status === 401) {
              console.log('Auth error, clearing stored data');
              await storage.deleteItemAsync('auth_token');
              await storage.deleteItemAsync('user_data');
              return null;
            }

            // For other errors, return cached data
            return cachedUser;
          }
          return null;
        } catch (cacheError) {
          console.error('Error parsing cached user data:', cacheError);
          return null;
        }
      }
    } catch (error: any) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await storage.getItemAsync('auth_token');
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    return this.retryRequest(async () => {
      // Convert the profile data to match the API expectation
      const apiData = {
        name: `${profileData.first_name} ${profileData.last_name}`.trim(),
        email: profileData.email,
        // Add other fields if needed
      };

      const response = await api.post('/user/profile', apiData);
      const updatedUser = response.data.user;

      // Update stored user data
      await storage.setItemAsync('user_data', JSON.stringify(updatedUser));

      return updatedUser;
    });
  }

  async changePassword(passwordData: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    return this.retryRequest(async () => {
      await api.post('/user/change-password', passwordData);
    });
  }

  // Test function to check API connection
  async testConnection(): Promise<boolean> {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );

      const response = (await Promise.race([
        api.get('/'),
        timeoutPromise,
      ])) as any;

      console.log('API connection test successful:', response.data);
      return true;
    } catch (error: any) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}

export default new AuthService();
