import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import authService, { User, LoginCredentials, RegisterData } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const isAuthenticated = !!user;

  const refreshUser = async () => {
    try {
      console.log('Refreshing user data...');
      const userData = await authService.getCurrentUser();
      console.log('User data refreshed successfully:', !!userData);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Don't clear user data on network errors, keep cached data
      if (error instanceof Error && error.message.includes('Network error')) {
        console.log('Network error during refresh, keeping cached user data');
        return user; // Return current user data
      } else {
        setUser(null);
        return null;
      }
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      console.log('Attempting login...');
      const response = await authService.login(credentials);
      console.log('Login successful');
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      console.log('Attempting registration...');
      const response = await authService.register(userData);
      console.log('Registration successful');
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log('Logging out...');
      await authService.logout();
      console.log('Logout successful');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear user data
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        console.log('Initializing auth...');

        // Check if we have a token first
        const isAuth = await authService.isAuthenticated();
        console.log('Auth initialization - isAuthenticated:', isAuth);

        if (isAuth) {
          // Try to get user data
          const userData = await refreshUser();
          if (!userData) {
            // If we can't get user data but have a token, clear everything
            console.log(
              'Token exists but user data failed to load, clearing auth'
            );
            await authService.logout();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    // Only initialize once
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading: isLoading || !isInitialized, // Show loading until initialized
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
