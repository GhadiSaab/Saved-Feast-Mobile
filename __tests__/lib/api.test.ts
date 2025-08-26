import { testAPIConnection, testUserEndpoint } from '../../lib/api-test';

// Mock the api module
jest.mock('../../lib/api', () => ({
  get: jest.fn(),
}));

describe('API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('testAPIConnection', () => {
    it('should return true when API connection is successful', async () => {
      const mockApi = require('../../lib/api');
      mockApi.get.mockResolvedValue({ data: { message: 'API is working' } });

      const result = await testAPIConnection();
      expect(result).toBe(true);
    });

    it('should return false when API connection fails', async () => {
      const mockApi = require('../../lib/api');
      mockApi.get.mockRejectedValue(new Error('Network error'));

      const result = await testAPIConnection();
      expect(result).toBe(false);
    });
  });

  describe('testUserEndpoint', () => {
    it('should return user data when endpoint is successful', async () => {
      const mockApi = require('../../lib/api');
      const mockUserData = { id: 1, name: 'Test User' };
      mockApi.get.mockResolvedValue({ data: mockUserData });

      const result = await testUserEndpoint();
      expect(result).toEqual(mockUserData);
    });

    it('should return null when endpoint fails', async () => {
      const mockApi = require('../../lib/api');
      mockApi.get.mockRejectedValue(new Error('Unauthorized'));

      const result = await testUserEndpoint();
      expect(result).toBeNull();
    });
  });
});
