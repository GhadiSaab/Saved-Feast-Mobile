import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import authService from '../../lib/auth';

// Mock the auth service
jest.mock('../../lib/auth', () => ({
  getCurrentUser: jest.fn(),
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <View>
      <Text testID="isAuthenticated">{auth.isAuthenticated.toString()}</Text>
      <Text testID="isLoading">{auth.isLoading.toString()}</Text>
      <Text testID="user">
        {auth.user ? JSON.stringify(auth.user) : 'null'}
      </Text>
    </View>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AuthProvider', () => {
    it('should provide initial loading state', () => {
      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(getByTestId('isLoading').children[0]).toBe('true');
      expect(getByTestId('isAuthenticated').children[0]).toBe('false');
      expect(getByTestId('user').children[0]).toBe('null');
    });

    it('should initialize with authenticated user when token exists', async () => {
      const mockUser = { id: 1, email: 'test@example.com', first_name: 'Test' };

      (authService.isAuthenticated as jest.Mock).mockResolvedValue(true);
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('isLoading').children[0]).toBe('false');
        expect(getByTestId('isAuthenticated').children[0]).toBe('true');
        expect(getByTestId('user').children[0]).toBe(JSON.stringify(mockUser));
      });
    });

    it('should initialize without user when not authenticated', async () => {
      (authService.isAuthenticated as jest.Mock).mockResolvedValue(false);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(getByTestId('isLoading').children[0]).toBe('false');
        expect(getByTestId('isAuthenticated').children[0]).toBe('false');
        expect(getByTestId('user').children[0]).toBe('null');
      });
    });

    it('should clear auth when token exists but user data fails to load', async () => {
      (authService.isAuthenticated as jest.Mock).mockResolvedValue(true);
      (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const { getByTestId } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authService.logout).toHaveBeenCalled();
        expect(getByTestId('isAuthenticated').children[0]).toBe('false');
        expect(getByTestId('user').children[0]).toBe('null');
      });
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Auth methods', () => {
    let authContext: any;

    const TestComponentWithMethods = () => {
      authContext = useAuth();
      return null;
    };

    beforeEach(() => {
      (authService.isAuthenticated as jest.Mock).mockResolvedValue(false);
    });

    it('should handle successful login', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password',
      };

      (authService.login as jest.Mock).mockResolvedValue({ user: mockUser });

      render(
        <AuthProvider>
          <TestComponentWithMethods />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext).toBeDefined();
      });

      await act(async () => {
        await authContext.login(mockCredentials);
      });

      expect(authService.login).toHaveBeenCalledWith(mockCredentials);
      expect(authContext.user).toEqual(mockUser);
      expect(authContext.isAuthenticated).toBe(true);
    });

    it('should handle login failure', async () => {
      const mockCredentials = { email: 'test@example.com', password: 'wrong' };
      const mockError = new Error('Invalid credentials');

      (authService.login as jest.Mock).mockRejectedValue(mockError);

      render(
        <AuthProvider>
          <TestComponentWithMethods />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext).toBeDefined();
      });

      await expect(async () => {
        await act(async () => {
          await authContext.login(mockCredentials);
        });
      }).rejects.toThrow('Invalid credentials');
    });

    it('should handle successful registration', async () => {
      const mockUser = { id: 1, email: 'new@example.com' };
      const mockUserData = {
        email: 'new@example.com',
        password: 'password',
        first_name: 'New',
      };

      (authService.register as jest.Mock).mockResolvedValue({ user: mockUser });

      render(
        <AuthProvider>
          <TestComponentWithMethods />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext).toBeDefined();
      });

      await act(async () => {
        await authContext.register(mockUserData);
      });

      expect(authService.register).toHaveBeenCalledWith(mockUserData);
      expect(authContext.user).toEqual(mockUser);
      expect(authContext.isAuthenticated).toBe(true);
    });

    it('should handle registration failure', async () => {
      const mockUserData = { email: 'invalid', password: 'password' };
      const mockError = new Error('Invalid email');

      (authService.register as jest.Mock).mockRejectedValue(mockError);

      render(
        <AuthProvider>
          <TestComponentWithMethods />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext).toBeDefined();
      });

      await expect(async () => {
        await act(async () => {
          await authContext.register(mockUserData);
        });
      }).rejects.toThrow('Invalid email');
    });

    it('should handle successful logout', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      render(
        <AuthProvider>
          <TestComponentWithMethods />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext).toBeDefined();
      });

      await act(async () => {
        await authContext.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(authContext.user).toBeNull();
      expect(authContext.isAuthenticated).toBe(false);
    });

    it('should clear user data even if logout fails', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const mockError = new Error('Logout failed');

      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.logout as jest.Mock).mockRejectedValue(mockError);

      render(
        <AuthProvider>
          <TestComponentWithMethods />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext).toBeDefined();
      });

      await act(async () => {
        await authContext.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(authContext.user).toBeNull();
      expect(authContext.isAuthenticated).toBe(false);
    });

    it('should handle refreshUser successfully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };

      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponentWithMethods />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext).toBeDefined();
      });

      const result = await act(async () => {
        return await authContext.refreshUser();
      });

      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
      expect(authContext.user).toEqual(mockUser);
    });

    it('should handle refreshUser network error gracefully', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const networkError = new Error('Network error occurred');

      (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.getCurrentUser as jest.Mock).mockRejectedValueOnce(
        networkError
      );

      render(
        <AuthProvider>
          <TestComponentWithMethods />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext).toBeDefined();
      });

      // Set initial user
      authContext.user = mockUser;

      const result = await act(async () => {
        return await authContext.refreshUser();
      });

      expect(result).toBeNull(); // Should return null on network error
    });

    it('should clear user on refreshUser non-network error', async () => {
      const mockError = new Error('Unauthorized');

      (authService.getCurrentUser as jest.Mock).mockRejectedValue(mockError);

      render(
        <AuthProvider>
          <TestComponentWithMethods />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(authContext).toBeDefined();
      });

      const result = await act(async () => {
        return await authContext.refreshUser();
      });

      expect(result).toBeNull();
      expect(authContext.user).toBeNull();
    });
  });
});
