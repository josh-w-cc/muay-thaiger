import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import train from './train.js';

const BASE_STATS = {
  agility: 0n,
  anima: 1n,
  constitution: 0n,
  skill: 0n,
  speed: 1n,
  stamina: 0n,
  strength: 0n,
  vigor: 1n,
  vitality: 1n,
};

describe('train', () => {
  it('returns unchanged stats and gold with an empty regimen', () => {
    const fighter = {
      details: {gold: 0n, regimen: [], stats: {...BASE_STATS}},
    };

    const result = train(fighter);

    assert.deepEqual(result.details.stats, BASE_STATS);
    assert.equal(result.details.gold, 0n);
  });

  it('returns unchanged stats when no skills are enabled', () => {
    const now = Date.now();
    const fighter = {
      details: {gold: 0n, regimen: [{enabled: false, id: 2, lastUsed: now - 5000}], stats: {...BASE_STATS}},
    };

    const result = train(fighter, new Date(now));

    assert.deepEqual(result.details.stats, BASE_STATS);
    assert.equal(result.details.gold, 0n);
  });

  it('returns unchanged stats when not enough time has elapsed', () => {
    const now = Date.now();
    const fighter = {
      details: {gold: 0n, regimen: [{enabled: true, id: 2, lastUsed: now}], stats: {...BASE_STATS}},
    };

    const result = train(fighter, new Date(now));

    assert.deepEqual(result.details.stats, BASE_STATS);
  });

  it('trains stamina when the walking skill fires', () => {
    const now = Date.now();
    const fighter = {
      details: {gold: 0n, regimen: [{enabled: true, id: 2, lastUsed: now - 2000}], stats: {...BASE_STATS}},
    };

    const result = train(fighter, new Date(now));

    assert.equal(result.details.stats.stamina, 1n);
  });

  it('scales stamina training by vitality', () => {
    const now = Date.now();
    const fighter = {
      details: {
        gold: 0n,
        regimen: [{enabled: true, id: 2, lastUsed: now - 2000}],
        stats: {...BASE_STATS, vitality: 3n},
      },
    };

    const result = train(fighter, new Date(now));

    assert.equal(result.details.stats.stamina, 3n);
  });

  it('increases gold when the begging skill fires', () => {
    const now = Date.now();
    const fighter = {
      details: {gold: 0n, regimen: [{enabled: true, id: 1, lastUsed: now - 2000}], stats: {...BASE_STATS}},
    };

    const result = train(fighter, new Date(now));

    assert.equal(result.details.gold, 1n);
    assert.equal(result.details.stats.stamina, 0n);
  });

  it('applies multiple skills from the regimen in a round-robin cycle', () => {
    const now = Date.now();
    const fighter = {
      details: {
        gold: 0n,
        regimen: [
          {enabled: true, id: 2, lastUsed: now - 3000},
          {enabled: true, id: 1, lastUsed: now - 3000},
        ],
        stats: {...BASE_STATS},
      },
    };

    const result = train(fighter, new Date(now));

    assert.equal(result.details.stats.stamina, 1n);
    assert.equal(result.details.gold, 1n);
  });

  it('starts w/ the most recent skill when multiple skills', () => {
    const now = Date.now();
    const fighter = {
      details: {
        gold: 0n,
        regimen: [
          {enabled: true, id: 2, lastUsed: now - 5000},
          {enabled: true, id: 1, lastUsed: now - 4000},
        ],
        stats: {...BASE_STATS},
      },
    };

    const result = train(fighter, new Date(now));

    assert.equal(result.details.stats.stamina, 2n);
    assert.equal(result.details.gold, 1n);
  });

  it('updates lastUsed for each fired skill in the returned regimen', () => {
    const now = Date.now();
    const originalLastUsed = now - 2000;
    const fighter = {
      details: {gold: 0n, regimen: [{enabled: true, id: 2, lastUsed: originalLastUsed}], stats: {...BASE_STATS}},
    };

    const result = train(fighter, new Date(now));

    const walking = result.details.regimen.find((s) => s.id === 2);
    assert.ok(walking);
    assert.ok(walking.lastUsed > originalLastUsed);
  });

  it('keeps fired skills in the returned regimen', () => {
    const now = Date.now();
    const fighter = {
      details: {gold: 0n, regimen: [{enabled: true, id: 2, lastUsed: now - 2000}], stats: {...BASE_STATS}},
    };

    const result = train(fighter, new Date(now));

    assert.equal(result.details.regimen.length, 1);
    assert.equal(result.details.regimen[0].id, 2);
  });

  it('keeps disabled skills in the returned regimen unchanged', () => {
    const now = Date.now();
    const disabledLastUsed = now - 5000;
    const fighter = {
      details: {
        gold: 0n,
        regimen: [
          {enabled: false, id: 2, lastUsed: disabledLastUsed},
          {enabled: true, id: 1, lastUsed: now - 2000},
        ],
        stats: {...BASE_STATS},
      },
    };

    const result = train(fighter, new Date(now));

    const disabled = result.details.regimen.find((s) => s.id === 2);
    assert.ok(disabled);
    assert.equal(disabled.lastUsed, disabledLastUsed);
  });
});

