import formatHugeNumber from './formatHugeNumber.js';


describe('formatHugeNumber', () => {
  it('keeps values with five digits or fewer as-is', () => {
    expect(formatHugeNumber(99999)).toBe(99999);
    expect(formatHugeNumber(-99999)).toBe(-99999);
  });

  it('formats values above five digits in scientific notation', () => {
    expect(formatHugeNumber(100000)).toBe('1.00e+5');
    expect(formatHugeNumber(-100000)).toBe('-1.00e+5');
  });
});
