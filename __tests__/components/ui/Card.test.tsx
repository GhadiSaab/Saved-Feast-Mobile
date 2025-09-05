import React from 'react';
import { render } from '@testing-library/react-native';
import { Card } from '../../../components/ui/Card';

// Mock react-native
jest.mock('react-native', () => ({
  View: 'View',
  StyleSheet: {
    create: jest.fn(styles => styles),
  },
}));

describe('Card', () => {
  it('should render children', () => {
    const { getByText } = render(
      <Card>
        <div>Card content</div>
      </Card>
    );

    expect(getByText('Card content')).toBeTruthy();
  });

  it('should render with custom style', () => {
    const customStyle = { backgroundColor: '#FF0000' };
    const { getByTestId } = render(
      <Card style={customStyle}>
        <div>Card content</div>
      </Card>
    );

    expect(getByTestId('card')).toBeTruthy();
  });

  it('should render with elevation', () => {
    const { getByTestId } = render(
      <Card elevation={5}>
        <div>Card content</div>
      </Card>
    );

    expect(getByTestId('card')).toBeTruthy();
  });
});
