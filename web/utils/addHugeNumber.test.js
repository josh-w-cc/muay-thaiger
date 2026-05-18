import addHugeNumber from './addHugeNumber.js';


describe('addHugeNumber', () => {
  it('adds a number to an integer string', () => {
    expect(addHugeNumber('123', 7)).toBe('130');
  });

  it('adds a string to an integer string', () => {
    expect(addHugeNumber('123', '77')).toBe('200');
  });

  it('carries across all digits', () => {
    expect(addHugeNumber('99999', 1)).toBe('100000');
  });

  it('adds very large integer strings without precision loss', () => {
    expect(addHugeNumber('123456789012345678901234567890', '987654321098765432109876543210')).toBe('1111111110111111111011111111100');
  });

  it('normalizes leading symbols and zeroes', () => {
    expect(addHugeNumber('+00099', '+00001')).toBe('100');
  });

  it('returns the original value for invalid values', () => {
    expect(addHugeNumber(100, 1)).toBe(100);
    expect(addHugeNumber('100', -1)).toBe('100');
    expect(addHugeNumber('100', 'not-a-number')).toBe('100');
  });
});
