import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {parseBigIntStats} from './stats.js';

describe('parseBigIntStats', () => {
  it('converts numeric string values to BigInt', () => {
    assert.deepEqual(parseBigIntStats({strength: '5', agility: '3'}), {agility: 3n, strength: 5n});
  });

  it('converts number values to BigInt', () => {
    assert.deepEqual(parseBigIntStats({stamina: 10}), {stamina: 10n});
  });

  it('passes BigInt values through as BigInt', () => {
    assert.deepEqual(parseBigIntStats({skill: 7n}), {skill: 7n});
  });

  it('converts null and undefined values to 0n', () => {
    assert.deepEqual(parseBigIntStats({agility: null, strength: undefined}), {agility: 0n, strength: 0n});
  });

  it('returns an empty object for empty input', () => {
    assert.deepEqual(parseBigIntStats({}), {});
  });
});
