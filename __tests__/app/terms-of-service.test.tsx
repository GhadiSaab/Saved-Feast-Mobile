import React from 'react';
import { render } from '@testing-library/react-native';
import TermsOfServiceScreen from '../../app/terms-of-service';

// Override the global ThemedText mock for this test
jest.unmock('@/components/ThemedText');
jest.unmock('../../components/ThemedText');

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: {
    Screen: 'Screen',
  },
}));

describe('TermsOfServiceScreen', () => {
  it('should render terms of service content', () => {
    const { getByText } = render(<TermsOfServiceScreen />);

    expect(getByText('Terms of Service')).toBeTruthy();
  });

  it('should render last updated date', () => {
    const { getByText } = render(<TermsOfServiceScreen />);

    expect(getByText(/Last updated:/)).toBeTruthy();
  });
});
