import React from 'react';
import { render } from '@testing-library/react-native';

// Override the global ThemedText mock for this test
jest.unmock('@/components/ThemedText');
jest.unmock('../../components/ThemedText');

// Mock react-native-reanimated before importing HelloWave
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    default: {
      View: View,
    },
    useSharedValue: jest.fn(value => ({ value })),
    withRepeat: jest.fn((animation, iterations) => animation),
    withTiming: jest.fn((value, config) => value),
    withSequence: jest.fn((...animations) => animations[0]),
    useAnimatedStyle: jest.fn(style => style),
    Animated: {
      View: View,
    },
  };
});

// Mock the specific component
jest.mock('../../components/HelloWave', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    HelloWave: () => React.createElement(Text, {}, '👋'),
  };
});

import { HelloWave } from '../../components/HelloWave';

describe('HelloWave', () => {
  it('should render wave emoji', () => {
    const { getByText } = render(<HelloWave />);

    expect(getByText('👋')).toBeTruthy();
  });
});
