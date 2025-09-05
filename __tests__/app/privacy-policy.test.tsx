import React from 'react';
import { render } from '@testing-library/react-native';
import PrivacyPolicyScreen from '../../app/privacy-policy';

// Override the global ThemedText mock for this test
jest.unmock('@/components/ThemedText');
jest.unmock('../../components/ThemedText');

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: {
    Screen: 'Screen',
  },
}));

describe('PrivacyPolicyScreen', () => {
  it('should render privacy policy content', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);

    expect(getByText('Privacy Policy')).toBeTruthy();
  });

  it('should render last updated date', () => {
    const { getByText } = render(<PrivacyPolicyScreen />);

    expect(getByText(/Last updated:/)).toBeTruthy();
  });
});
