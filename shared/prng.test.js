import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import createPRNG from './prng.js';

describe('createPRNG', () => {
  it('returns values in [0, 1)', () => {
    const next = createPRNG(42);
    for(let i = 0; i < 100; i++) {
      const value = next();
      assert.ok(value >= 0, `expected value >= 0, got ${value}`);
      assert.ok(value < 1, `expected value < 1, got ${value}`);
    }
  });

  it('generates a deterministic sequence from the same seed', () => {
    const firstNext = createPRNG(12345);
    const secondNext = createPRNG(12345);
    for(let i = 0; i < 10; i++) {
      assert.equal(firstNext(), secondNext());
    }
  });

  it('produces distinct sequences from different seeds', () => {
    const firstNext = createPRNG(1);
    const secondNext = createPRNG(2);
    const firstValues = [firstNext(), firstNext(), firstNext()];
    const secondValues = [secondNext(), secondNext(), secondNext()];
    assert.notDeepEqual(firstValues, secondValues);
  });

  it('works with seed 0', () => {
    const next = createPRNG(0);
    const value = next();
    assert.ok(value >= 0);
    assert.ok(value < 1);
  });

  it('works with the maximum 32-bit seed value', () => {
    const next = createPRNG(2 ** 32 - 1);
    const value = next();
    assert.ok(value >= 0);
    assert.ok(value < 1);
  });

  it('maintains independent state per instance', () => {
    const firstNext = createPRNG(99);
    firstNext();
    firstNext();

    const secondNext = createPRNG(99);
    // firstNext is two steps ahead; secondNext starts fresh at step one
    assert.notEqual(firstNext(), secondNext());
  });
});
