import React from 'react';
import TabBarBackground, { useBottomTabOverflow } from '../../../components/ui/TabBarBackground';

describe('TabBarBackground', () => {
  it('should export undefined for TabBarBackground', () => {
    expect(TabBarBackground).toBeUndefined();
  });

  it('should export useBottomTabOverflow hook', () => {
    const result = useBottomTabOverflow();
    expect(result).toBe(0);
  });
});
