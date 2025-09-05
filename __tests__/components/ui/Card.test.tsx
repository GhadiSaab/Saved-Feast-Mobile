import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Card } from '../../../components/ui/Card';

describe('Card', () => {
  it('should render children', () => {
    const { getByText } = render(
      <Card>
        <Text>Card content</Text>
      </Card>
    );

    expect(getByText('Card content')).toBeTruthy();
  });

  it('should render with custom style', () => {
    const customStyle = { backgroundColor: '#FF0000' };
    const { getByTestId } = render(
      <Card style={customStyle}>
        <Text>Card content</Text>
      </Card>
    );

    expect(getByTestId('card')).toBeTruthy();
  });

  it('should render with elevation', () => {
    const { getByTestId } = render(
      <Card elevation={5}>
        <Text>Card content</Text>
      </Card>
    );

    expect(getByTestId('card')).toBeTruthy();
  });
});
