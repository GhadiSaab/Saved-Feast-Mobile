import React from 'react';
import { render } from '@testing-library/react-native';
import { HelloWave } from '../../components/HelloWave';

describe('HelloWave', () => {
  it('should render wave emoji', () => {
    const { getByText } = render(<HelloWave />);

    expect(getByText('👋')).toBeTruthy();
  });
});
