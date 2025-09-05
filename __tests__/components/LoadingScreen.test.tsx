import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingScreen } from '../../components/LoadingScreen';

// Mock react-native
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  StyleSheet: {
    create: jest.fn(styles => styles),
  },
}));

// Mock LoadingSpinner
jest.mock('../../components/LoadingSpinner', () => ({
  LoadingSpinner: 'LoadingSpinner',
}));

describe('LoadingScreen', () => {
  it('should render with default message', () => {
    const { getByText } = render(<LoadingScreen />);

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('should render with custom message', () => {
    const { getByText } = render(<LoadingScreen message="Please wait..." />);

    expect(getByText('Please wait...')).toBeTruthy();
  });

  it('should render loading spinner', () => {
    const { getByTestId } = render(<LoadingScreen />);

    expect(getByTestId('loading-screen')).toBeTruthy();
  });
});
