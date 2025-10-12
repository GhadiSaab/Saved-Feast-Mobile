import api from './api';

/**
 * Formats image URLs to be properly accessible
 * @param imagePath - The image path from the API response
 * @returns Properly formatted image URL
 */
export const formatImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) {
    return null;
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Get the base URL from the API instance
  const baseURL = api.defaults.baseURL;
  
  // Remove '/api' from the base URL to get the server root
  const serverRoot = baseURL?.replace('/api', '') || 'http://192.168.1.20:8000';
  
  // Handle different path formats
  if (imagePath.startsWith('/storage/')) {
    // Laravel storage path - convert to public URL
    return `${serverRoot}${imagePath}`;
  } else if (imagePath.startsWith('storage/')) {
    // Laravel storage path without leading slash
    return `${serverRoot}/${imagePath}`;
  } else if (imagePath.startsWith('meals/')) {
    // Relative path from public directory
    return `${serverRoot}/${imagePath}`;
  } else {
    // Default case - assume it's a relative path
    return `${serverRoot}/${imagePath}`;
  }
};

/**
 * Validates if an image URL is accessible
 * @param url - The image URL to validate
 * @returns Promise<boolean> - Whether the image is accessible
 */
export const validateImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.log('Image validation failed:', url, error);
    return false;
  }
};

/**
 * Gets a fallback image URL for when the primary image fails
 * @param mealId - The meal ID
 * @returns Fallback image URL
 */
export const getFallbackImageUrl = (mealId: number): string => {
  // You can implement a fallback strategy here
  // For now, return null to show placeholder
  return '';
};
