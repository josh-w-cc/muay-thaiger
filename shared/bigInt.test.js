import {strictEqual} from 'node:assert';
import {describe, it} from 'node:test';

import './bigInt.js';


describe('BigInt prototype patch', () => {
  it('serializes BigInt values as JSON strings', () => {
    strictEqual(JSON.stringify({gold: 123n}), '{"gold":"123"}');
  });

  it('formats BigInt values with scientific notation above five digits', () => {
    strictEqual((100000n).toFormattedNumber(), '1.00e5');
  });

  it('returns plain digits when BigInt has five digits or fewer', () => {
    strictEqual((99999n).toFormattedNumber(), '99999');
  });
});
