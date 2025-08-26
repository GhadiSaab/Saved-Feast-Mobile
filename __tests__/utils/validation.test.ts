// Utility validation tests

describe('Validation Utils', () => {
  describe('Email validation', () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('Password validation', () => {
    const isValidPassword = (password: string): boolean => {
      return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
    };

    it('should validate strong passwords', () => {
      expect(isValidPassword('Password123')).toBe(true);
      expect(isValidPassword('MySecurePass1')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(isValidPassword('weak')).toBe(false);
      expect(isValidPassword('password')).toBe(false);
      expect(isValidPassword('PASSWORD123')).toBe(false);
      expect(isValidPassword('')).toBe(false);
    });
  });

  describe('Price validation', () => {
    const isValidPrice = (price: number): boolean => {
      return typeof price === 'number' && price >= 0 && price <= 1000;
    };

    it('should validate reasonable prices', () => {
      expect(isValidPrice(0)).toBe(true);
      expect(isValidPrice(15.99)).toBe(true);
      expect(isValidPrice(1000)).toBe(true);
    });

    it('should reject invalid prices', () => {
      expect(isValidPrice(-1)).toBe(false);
      expect(isValidPrice(1001)).toBe(false);
      expect(isValidPrice(NaN)).toBe(false);
    });
  });
});
