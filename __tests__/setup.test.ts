describe('Jest Setup', () => {
  it('should be able to run basic tests', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have proper environment setup', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});

