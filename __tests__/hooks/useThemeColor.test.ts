import { useThemeColor } from '../../hooks/useThemeColor';
import { Colors } from '../../constants/Colors';

// Mock useColorScheme
jest.mock('../../hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

describe('useThemeColor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return light theme color when color scheme is light', () => {
    const { useColorScheme } = require('../../hooks/useColorScheme');
    useColorScheme.mockReturnValue('light');

    const result = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');

    expect(result).toBe('#000000');
  });

  it('should return dark theme color when color scheme is dark', () => {
    const { useColorScheme } = require('../../hooks/useColorScheme');
    useColorScheme.mockReturnValue('dark');

    const result = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');

    expect(result).toBe('#FFFFFF');
  });

  it('should return light theme color when color scheme is null', () => {
    const { useColorScheme } = require('../../hooks/useColorScheme');
    useColorScheme.mockReturnValue(null);

    const result = useThemeColor({ light: '#000000', dark: '#FFFFFF' }, 'text');

    expect(result).toBe('#000000');
  });

  it('should return color from Colors when no props provided', () => {
    const { useColorScheme } = require('../../hooks/useColorScheme');
    useColorScheme.mockReturnValue('light');

    const result = useThemeColor({}, 'text');

    expect(result).toBe(Colors.light.text);
  });

  it('should return color from Colors for dark theme', () => {
    const { useColorScheme } = require('../../hooks/useColorScheme');
    useColorScheme.mockReturnValue('dark');

    const result = useThemeColor({}, 'text');

    expect(result).toBe(Colors.dark.text);
  });
});
