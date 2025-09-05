import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedView } from '../../components/ThemedView';

// Mock react-native
jest.mock('react-native', () => ({
  View: 'View',
  StyleSheet: {
    create: jest.fn(styles => styles),
  },
}));

describe('ThemedView', () => {
  it('should render children', () => {
    const { getByText } = render(
      <ThemedView>
        <div>Test content</div>
      </ThemedView>
    );

    expect(getByText('Test content')).toBeTruthy();
  });

  it('should render with custom style', () => {
    const customStyle = { backgroundColor: '#FF0000' };
    const { getByTestId } = render(
      <ThemedView style={customStyle}>
        <div>Test content</div>
      </ThemedView>
    );

    expect(getByTestId('themed-view')).toBeTruthy();
  });
});
