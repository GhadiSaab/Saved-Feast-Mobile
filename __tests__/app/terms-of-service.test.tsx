import React from 'react';
import { render } from '@testing-library/react-native';
import TermsOfServiceScreen from '../../app/terms-of-service';

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
    create: jest.fn((styles) => styles),
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
