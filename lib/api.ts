import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.116:8000/api' // Replace with your computer's IP address
  : 'https://your-production-domain.com/api'; // Replace with your production URL

// Create axios instance with increased timeout
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // Increased to 30 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
      // You might want to trigger a navigation to login here
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      // Network error or no response
      error.message = 'Network error. Please check your connection.';
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      error.message = 'Request timeout. Please try again.';
    } else if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    } else if (error.response?.status === 404) {
      error.message = 'Resource not found.';
    } else if (error.response?.status === 422) {
      // Validation error - keep original message
      error.message = error.response.data?.message || 'Validation error.';
    }
    
    return Promise.reject(error);
  }
);

export default api;
