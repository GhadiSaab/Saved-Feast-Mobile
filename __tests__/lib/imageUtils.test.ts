import { formatImageUrl } from '@/lib/imageUtils';

// Mock the api module
jest.mock('@/lib/api', () => ({
  defaults: {
    baseURL: 'http://192.168.1.20:8000/api',
  },
}));

describe('ImageUtils', () => {
  describe('formatImageUrl', () => {
    it('should return null for null or undefined input', () => {
      expect(formatImageUrl(null)).toBeNull();
      expect(formatImageUrl(undefined)).toBeNull();
      expect(formatImageUrl('')).toBeNull();
    });

    it('should return full URLs as-is', () => {
      const fullUrl = 'https://example.com/image.jpg';
      expect(formatImageUrl(fullUrl)).toBe(fullUrl);
      
      const httpUrl = 'http://example.com/image.jpg';
      expect(formatImageUrl(httpUrl)).toBe(httpUrl);
    });

    it('should format Laravel storage paths correctly', () => {
      const storagePath = '/storage/meals/image.jpg';
      const expected = 'http://192.168.1.20:8000/storage/meals/image.jpg';
      expect(formatImageUrl(storagePath)).toBe(expected);
    });

    it('should format storage paths without leading slash', () => {
      const storagePath = 'storage/meals/image.jpg';
      const expected = 'http://192.168.1.20:8000/storage/meals/image.jpg';
      expect(formatImageUrl(storagePath)).toBe(expected);
    });

    it('should format relative paths correctly', () => {
      const relativePath = 'meals/image.jpg';
      const expected = 'http://192.168.1.20:8000/meals/image.jpg';
      expect(formatImageUrl(relativePath)).toBe(expected);
    });

    it('should handle default case for unknown paths', () => {
      const unknownPath = 'some/path/image.jpg';
      const expected = 'http://192.168.1.20:8000/some/path/image.jpg';
      expect(formatImageUrl(unknownPath)).toBe(expected);
    });
  });
});
