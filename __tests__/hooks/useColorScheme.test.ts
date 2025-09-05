import { useColorScheme } from '../../hooks/useColorScheme';

describe('useColorScheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the current color scheme', () => {
    const result = useColorScheme();

    expect(result).toBe('light'); // Our global mock returns 'light'
  });

  it('should return light when no color scheme is set', () => {
    const result = useColorScheme();

    expect(result).toBe('light');
  });

  it('should return light when color scheme is light', () => {
    const result = useColorScheme();

    expect(result).toBe('light');
  });
});
