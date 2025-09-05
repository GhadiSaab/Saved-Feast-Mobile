import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '../../components/ThemedText';

// Mock react-native
jest.mock('react-native', () => ({
  Text: 'Text',
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
}));

describe('ThemedText', () => {
  it('should render text content', () => {
    const { getByText } = render(<ThemedText>Hello World</ThemedText>);
    
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('should render with custom style', () => {
    const customStyle = { color: '#FF0000' };
    const { getByText } = render(
      <ThemedText style={customStyle}>Styled text</ThemedText>
    );
    
    expect(getByText('Styled text')).toBeTruthy();
  });

  it('should render with light theme', () => {
    const { getByText } = render(
      <ThemedText lightColor="#000000" darkColor="#FFFFFF">
        Themed text
      </ThemedText>
    );
    
    expect(getByText('Themed text')).toBeTruthy();
  });
});
