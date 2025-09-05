import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../../components/ui/Button';

// Mock react-native
jest.mock('react-native', () => ({
  TouchableOpacity: 'TouchableOpacity',
  Text: 'Text',
  ActivityIndicator: 'ActivityIndicator',
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
}));

describe('Button', () => {
  it('should render with title', () => {
    const { getByText } = render(<Button title="Click me" />);
    
    expect(getByText('Click me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<Button title="Click me" onPress={mockOnPress} />);
    
    fireEvent.press(getByText('Click me'));
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('should render with primary variant', () => {
    const { getByText } = render(<Button title="Primary" variant="primary" />);
    
    expect(getByText('Primary')).toBeTruthy();
  });

  it('should render with outline variant', () => {
    const { getByText } = render(<Button title="Outline" variant="outline" />);
    
    expect(getByText('Outline')).toBeTruthy();
  });

  it('should render with small size', () => {
    const { getByText } = render(<Button title="Small" size="small" />);
    
    expect(getByText('Small')).toBeTruthy();
  });

  it('should render with large size', () => {
    const { getByText } = render(<Button title="Large" size="large" />);
    
    expect(getByText('Large')).toBeTruthy();
  });

  it('should show loading state', () => {
    const { getByTestId } = render(<Button title="Loading" loading={true} />);
    
    expect(getByTestId('button-loading')).toBeTruthy();
  });

  it('should be disabled when loading', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<Button title="Loading" loading={true} onPress={mockOnPress} />);
    
    fireEvent.press(getByText('Loading'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<Button title="Disabled" disabled={true} onPress={mockOnPress} />);
    
    fireEvent.press(getByText('Disabled'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
