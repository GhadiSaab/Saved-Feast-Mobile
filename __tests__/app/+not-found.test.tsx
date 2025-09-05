import React from 'react';
import { render } from '@testing-library/react-native';
import NotFoundScreen from '../../app/+not-found';

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: 'Link',
  Stack: {
    Screen: 'Screen',
  },
}));

// Mock react-native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  StyleSheet: {
    create: jest.fn(styles => styles),
  },
}));

describe('NotFoundScreen', () => {
  it('should render not found message', () => {
    const { getByText } = render(<NotFoundScreen />);

    expect(getByText("This screen doesn't exist.")).toBeTruthy();
  });

  it('should render link to home', () => {
    const { getByText } = render(<NotFoundScreen />);

    expect(getByText('Go to home screen!')).toBeTruthy();
  });
});
