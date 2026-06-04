import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {FIGHT_REASONS, isFightReason, normalizeFightRank, normalizeFightReason} from './fights.js';

describe('fights', () => {
  it('defines shared fight reasons', () => {
    assert.deepEqual(FIGHT_REASONS, ['gold', 'rank']);
  });

  it('normalizes fight reason strings', () => {
    assert.equal(normalizeFightReason(' gold '), 'gold');
    assert.equal(normalizeFightReason(1), '');
  });

  it('validates fight reasons', () => {
    assert.equal(isFightReason('gold'), true);
    assert.equal(isFightReason('rank'), true);
    assert.equal(isFightReason(' rank '), true);
    assert.equal(isFightReason('tournament'), false);
  });

  it('normalizes fight rank strings', () => {
    assert.equal(normalizeFightRank(' A '), 'A');
    assert.equal(normalizeFightRank(1), '');
  });
});
