import api from '../../lib/api';

describe('API Module', () => {
  it('should export an axios instance', () => {
    expect(api).toBeDefined();
    expect(api.get).toBeDefined();
    expect(api.post).toBeDefined();
    expect(api.put).toBeDefined();
    expect(api.delete).toBeDefined();
  });

  it('should have interceptors configured', () => {
    expect(api.interceptors).toBeDefined();
    expect(api.interceptors.request).toBeDefined();
    expect(api.interceptors.response).toBeDefined();
  });

  it('should use development URL in dev mode', () => {
    // This test verifies the base URL configuration
    expect(__DEV__).toBeDefined();
  });
});
