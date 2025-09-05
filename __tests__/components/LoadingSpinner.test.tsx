import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingSpinner } from '../../components/LoadingSpinner';

// Mock react-native
jest.mock('react-native', () => ({
  View: 'View',
  ActivityIndicator: 'ActivityIndicator',
  Text: 'Text',
  StyleSheet: {
    create: jest.fn(styles => styles),
  },
}));

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    const { getByTestId } = render(<LoadingSpinner />);

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('should render with small size', () => {
    const { getByTestId } = render(<LoadingSpinner size="small" />);

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('should render with large size', () => {
    const { getByTestId } = render(<LoadingSpinner size="large" />);

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('should render with fullScreen prop', () => {
    const { getByTestId } = render(<LoadingSpinner fullScreen={true} />);

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('should render with message', () => {
    const { getByText } = render(<LoadingSpinner message="Loading..." />);

    expect(getByText('Loading...')).toBeTruthy();
  });
});
