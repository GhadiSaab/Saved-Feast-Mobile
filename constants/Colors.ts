/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2D5A27'; // Sage green
const tintColorDark = '#4A7C59';

export const Colors = {
  light: {
    text: '#2C3E50',
    background: '#F8F6F1', // Warm beige
    tint: tintColorLight,
    tabIconDefault: '#95A5A6',
    tabIconSelected: tintColorLight,
    primary: '#2D5A27', // Sage green
    secondary: '#8B4513', // Saddle brown
    accent: '#E67E22', // Carrot orange
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E74C3C',
    card: '#FFFFFF',
    border: '#E8E8E8',
    warmBeige: '#F8F6F1',
    softCream: '#FDFBF7',
    dark: '#2C3E50',
  },
  dark: {
    text: '#F8F9FA',
    background: '#0D1117', // GitHub-style dark background
    tint: '#58A6FF', // GitHub blue for better visibility
    tabIconDefault: '#8B949E',
    tabIconSelected: '#58A6FF',
    primary: '#58A6FF', // Modern blue
    secondary: '#F85149', // Modern red
    accent: '#FFA657', // Modern orange
    success: '#3FB950', // Modern green
    warning: '#D29922', // Modern yellow
    error: '#F85149', // Modern red
    card: '#161B22', // GitHub-style card background
    border: '#30363D', // Better border contrast
    warmBeige: '#0D1117',
    softCream: '#161B22',
    dark: '#F8F9FA',
  },
};
