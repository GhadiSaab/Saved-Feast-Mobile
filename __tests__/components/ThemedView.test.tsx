import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ThemedView } from '../../components/ThemedView';

describe('ThemedView', () => {
  it('should render children', () => {
    const { getByText } = render(
      <ThemedView>
        <Text>Test content</Text>
      </ThemedView>
    );

    expect(getByText('Test content')).toBeTruthy();
  });

  it('should render with custom style', () => {
    const customStyle = { backgroundColor: '#FF0000' };
    const { getByTestId } = render(
      <ThemedView style={customStyle} testID="themed-view">
        <Text>Test content</Text>
      </ThemedView>
    );

    expect(getByTestId('themed-view')).toBeTruthy();
  });
});
