import {strictEqual} from 'node:assert';
import {describe, it} from 'node:test';

import patchBigIntPrototype from './bigInt.js';


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

  it('defines prototype methods as non-writable', () => {
    const formatDescriptor = Object.getOwnPropertyDescriptor(BigInt.prototype, 'toFormattedNumber');
    const jsonDescriptor = Object.getOwnPropertyDescriptor(BigInt.prototype, 'toJSON');
    strictEqual(formatDescriptor?.writable, false);
    strictEqual(jsonDescriptor?.writable, false);
  });

  it('reapplying the patch keeps existing methods intact', () => {
    const existingFormatMethod = BigInt.prototype.toFormattedNumber;
    const existingJsonMethod = BigInt.prototype.toJSON;

    patchBigIntPrototype();

    strictEqual(BigInt.prototype.toFormattedNumber, existingFormatMethod);
    strictEqual(BigInt.prototype.toJSON, existingJsonMethod);
  });

  it('returns the digit count as a BigInt for a power of ten', () => {
    strictEqual((1000000n).logApprox(), 7n);
  });

  it('returns the digit count as a BigInt for a non-power of ten', () => {
    strictEqual((500000n).logApprox(), 6n);
  });

  it('returns the digit count as a BigInt for a single-digit number', () => {
    strictEqual((5n).logApprox(), 1n);
  });

  it('defines logApprox as non-writable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(BigInt.prototype, 'logApprox');
    strictEqual(descriptor?.writable, false);
  });

  it('returns the same digit count for a negative BigInt as its absolute value', () => {
    strictEqual((-1000000n).logApprox(), (1000000n).logApprox());
  });

  it('returns 0n for zero', () => {
    strictEqual((0n).logApprox(), 0n);
  });
});
