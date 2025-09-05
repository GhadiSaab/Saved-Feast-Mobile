import React from 'react';
import { render } from '@testing-library/react-native';
import NotFoundScreen from '../../app/+not-found';

// Override the global ThemedText mock for this test
jest.unmock('@/components/ThemedText');
jest.unmock('../../components/ThemedText');

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: 'Link',
  Stack: {
    Screen: 'Screen',
  },
}));

describe('NotFoundScreen', () => {
  it('should render not found message', () => {
    const { getByText } = render(<NotFoundScreen />);

    expect(getByText('This screen does not exist.')).toBeTruthy();
  });

  it('should render link to home', () => {
    const { getByText } = render(<NotFoundScreen />);

    expect(getByText('Go to home screen!')).toBeTruthy();
  });
});
