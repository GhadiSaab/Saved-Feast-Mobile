import { Colors } from '../../constants/Colors';

describe('Colors', () => {
  it('should have light theme colors', () => {
    expect(Colors.light).toBeDefined();
    expect(Colors.light.background).toBeDefined();
    expect(Colors.light.text).toBeDefined();
  });

  it('should have dark theme colors', () => {
    expect(Colors.dark).toBeDefined();
    expect(Colors.dark.background).toBeDefined();
    expect(Colors.dark.text).toBeDefined();
  });

  it('should have consistent color structure', () => {
    const lightKeys = Object.keys(Colors.light);
    const darkKeys = Object.keys(Colors.dark);
    
    expect(lightKeys).toEqual(darkKeys);
  });
});
