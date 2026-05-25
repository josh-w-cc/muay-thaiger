import {strictEqual} from 'node:assert';
import {describe, it} from 'node:test';

import addHugeNumber from './addHugeNumber.js';

describe('addHugeNumber', () => {
  it('adds a number to an integer string', () => {
    strictEqual(addHugeNumber('123', 7), '130');
  });

  it('adds a string to an integer string', () => {
    strictEqual(addHugeNumber('123', '77'), '200');
  });

  it('adds a BigInt to an integer string', () => {
    strictEqual(addHugeNumber('123', 77n), '200');
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
