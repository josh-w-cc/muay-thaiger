import formatHugeNumber from './formatHugeNumber.js';


describe('formatHugeNumber', () => {
  it('keeps values with five digits or fewer as-is', () => {
    expect(formatHugeNumber(99999)).toBe(99999);
  });

  it('formats positive integers above five digits in scientific notation', () => {
    expect(formatHugeNumber(100000)).toBe('1.00e5');
  });

  it('supports positive integer strings without using number precision', () => {
    expect(formatHugeNumber('99999')).toBe('99999');
    expect(formatHugeNumber('100000')).toBe('1.00e5');
    expect(formatHugeNumber('12345678901234567890')).toBe('1.23e19');
    expect(formatHugeNumber('+00123')).toBe('123');
  });

  it('formats positive BigInt values', () => {
    expect(formatHugeNumber(99999n)).toBe('99999');
    expect(formatHugeNumber(100000n)).toBe('1.00e5');
  });

  it('returns non-positive-integer values as-is', () => {
    expect(formatHugeNumber(-100000)).toBe(-100000);
    expect(formatHugeNumber('-100000')).toBe('-100000');
    expect(formatHugeNumber(100000.1)).toBe(100000.1);
    expect(formatHugeNumber(-100000n)).toBe(-100000n);
  });

  it('returns non-integer strings as-is', () => {
    expect(formatHugeNumber('not-a-number')).toBe('not-a-number');
  });
});
