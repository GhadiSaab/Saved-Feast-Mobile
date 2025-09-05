import React from 'react';
import TabBarBackground, {
  useBottomTabOverflow,
} from '../../../components/ui/TabBarBackground';

describe('TabBarBackground', () => {
  it('should export TabBarBackground component', () => {
    // TabBarBackground can be undefined (web/Android) or a function (iOS)
    expect(
      typeof TabBarBackground === 'undefined' ||
        typeof TabBarBackground === 'function'
    ).toBe(true);
  });

  it('should export useBottomTabOverflow hook', () => {
    const result = useBottomTabOverflow();
    expect(result).toBe(0);
  });
});
