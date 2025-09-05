import React from 'react';
import { render } from '@testing-library/react-native';
import PrivacyPolicyScreen from '../../app/privacy-policy';

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: {
    Screen: 'Screen',
  },
}));

// Mock react-native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  StyleSheet: {
    create: jest.fn(styles => styles),
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
