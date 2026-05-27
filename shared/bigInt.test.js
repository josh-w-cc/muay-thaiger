import {strictEqual, ok} from 'node:assert';
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

  it('returns approximate log10 for a power of ten', () => {
    strictEqual((1000000n).logApprox(), 6);
  });

  it('returns approximate log10 between two integers for non-power of ten', () => {
    const result = (500000n).logApprox();
    ok(result > 5 && result < 6);
  });

  it('returns approximate log10 for a single-digit number', () => {
    const result = (5n).logApprox();
    ok(Math.abs(result - Math.log10(5)) < 1e-10);
  });

  it('defines logApprox as non-writable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(BigInt.prototype, 'logApprox');
    strictEqual(descriptor?.writable, false);
  });

  it('returns the same approximate log10 for a negative BigInt as its absolute value', () => {
    strictEqual((-1000000n).logApprox(), (1000000n).logApprox());
  });

  it('returns -Infinity for zero', () => {
    strictEqual((0n).logApprox(), -Infinity);
  });
});
