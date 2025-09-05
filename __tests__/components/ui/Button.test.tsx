import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../../components/ui/Button';

// Mock react-native (using global mock from jest.setup.js)

describe('Button', () => {
  it('should render with title', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Click me" onPress={mockOnPress} />
    );

    expect(getByText('Click me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Click me" onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Click me'));
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('should render with primary variant', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Primary" variant="primary" onPress={mockOnPress} />
    );

    expect(getByText('Primary')).toBeTruthy();
  });

  it('should render with outline variant', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Outline" variant="outline" onPress={mockOnPress} />
    );

    expect(getByText('Outline')).toBeTruthy();
  });

  it('should render with small size', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Small" size="small" onPress={mockOnPress} />
    );

    expect(getByText('Small')).toBeTruthy();
  });

  it('should render with large size', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Large" size="large" onPress={mockOnPress} />
    );

    expect(getByText('Large')).toBeTruthy();
  });

  it('should show loading state', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <Button title="Loading" loading={true} onPress={mockOnPress} />
    );

    expect(getByTestId('button-loading')).toBeTruthy();
  });

  it('should be disabled when loading', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Loading" loading={true} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Loading'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Disabled" disabled={true} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Disabled'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
