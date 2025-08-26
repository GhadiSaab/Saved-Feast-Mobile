import api from './api';

export const testAPIConnection = async () => {
  try {
    console.log('Testing API connection...');
    const response = await api.get('/');
    console.log('API connection successful:', response.data);
    return true;
  } catch (error: any) {
    console.error('API connection failed:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    return false;
  }
};

export const testUserEndpoint = async () => {
  try {
    console.log('Testing user endpoint...');
    const response = await api.get('/user');
    console.log('User endpoint successful:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('User endpoint failed:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    return null;
  }
};
