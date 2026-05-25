import {strictEqual} from 'node:assert';
import {describe, it} from 'node:test';

import addHugeNumber, {hugeNumberToDouble} from './addHugeNumber.js';

describe('addHugeNumber', () => {
  it('adds a number to an integer string', () => {
    strictEqual(addHugeNumber('123', 7), '130');
  });

  it('adds a string to an integer string', () => {
    strictEqual(addHugeNumber('123', '77'), '200');
  });

  it('carries across all digits', () => {
    strictEqual(addHugeNumber('99999', 1), '100000');
  });

  it('adds very large integer strings without precision loss', () => {
    strictEqual(addHugeNumber('123456789012345678901234567890', '987654321098765432109876543210'), '1111111110111111111011111111100');
  });

  it('normalizes leading symbols and zeroes', () => {
    strictEqual(addHugeNumber('+00099', '+00001'), '100');
  });

  it('returns non-string values as-is', () => {
    strictEqual(addHugeNumber(100, 1), 100);
  });

  it('returns the original value for negative addends', () => {
    strictEqual(addHugeNumber('100', -1), '100');
  });

  it('returns the original value for non-numeric addends', () => {
    strictEqual(addHugeNumber('100', 'not-a-number'), '100');
  });
});

describe('hugeNumberToDouble', () => {
  it('converts normalized integer strings to numbers', () => {
    strictEqual(hugeNumberToDouble('100000'), 100000);
  });

  it('converts very large integer strings to doubles', () => {
    strictEqual(hugeNumberToDouble('123456789012345678901234567890'), Number('123456789012345678901234567890'));
  });

  it('normalizes integer strings before converting', () => {
    strictEqual(hugeNumberToDouble('+00099'), 99);
  });

  it('returns finite numeric values as-is', () => {
    strictEqual(hugeNumberToDouble(123.45), 123.45);
  });

  it('returns non-integer-string values as-is', () => {
    const value = {};

    strictEqual(hugeNumberToDouble('not-a-number'), 'not-a-number');
    strictEqual(hugeNumberToDouble(value), value);
  });
});
