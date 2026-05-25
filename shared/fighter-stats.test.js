import {deepEqual, equal} from 'node:assert/strict';
import {describe, it} from 'node:test';

import {normalizeFighter, normalizeFighterStats, parseWholeBigInt, toSafeNumber} from './fighter-stats.js';


describe('parseWholeBigInt', () => {
  it('accepts whole-number strings, numbers, and BigInts', () => {
    equal(parseWholeBigInt('123'), 123n);
    equal(parseWholeBigInt(456), 456n);
    equal(parseWholeBigInt(789n), 789n);
  });

  it('returns null for invalid values', () => {
    equal(parseWholeBigInt(-1), null);
    equal(parseWholeBigInt(1.5), null);
    equal(parseWholeBigInt('abc'), null);
  });
});

describe('normalizeFighterStats', () => {
  it('converts only whole-number stat values to BigInt', () => {
    deepEqual(normalizeFighterStats({agility: '6', stamina: 7, strength: 8n, style: 'muay-thai'}), {
      agility: 6n,
      stamina: 7n,
      strength: 8n,
    });
  });
});

describe('normalizeFighter', () => {
  it('normalizes gold and stats on fighter records', () => {
    deepEqual(normalizeFighter({gold: '250', id: 5, stats: {agility: 6, stamina: '7'}}), {
      gold: 250n,
      id: 5,
      stats: {agility: 6n, stamina: 7n},
    });
  });
});

describe('toSafeNumber', () => {
  it('preserves finite numbers and approximates huge BigInts', () => {
    equal(toSafeNumber(12.5), 12.5);
    equal(toSafeNumber(25n), 25);
    equal(Number.isFinite(toSafeNumber(BigInt('9'.repeat(400)))), true);
  });
});
