import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Web-compatible storage interface
interface StorageInterface {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
}

// Web storage implementation using localStorage
class WebStorage implements StorageInterface {
  async getItemAsync(key: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Failed to get item from localStorage:', error);
      return null;
    }
  }

  async setItemAsync(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to set item in localStorage:', error);
    }
  }

  async deleteItemAsync(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to delete item from localStorage:', error);
    }
  }
}

// Create storage instance based on platform
const createStorage = (): StorageInterface => {
  if (Platform.OS === 'web') {
    return new WebStorage();
  }
  
  // For native platforms, use SecureStore
  return {
    async getItemAsync(key: string): Promise<string | null> {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (error) {
        console.warn('Failed to get item from SecureStore:', error);
        return null;
      }
    },
    
    async setItemAsync(key: string, value: string): Promise<void> {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (error) {
        console.warn('Failed to set item in SecureStore:', error);
      }
    },
    
    async deleteItemAsync(key: string): Promise<void> {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.warn('Failed to delete item from SecureStore:', error);
      }
    }
  };
};

export const storage = createStorage();
