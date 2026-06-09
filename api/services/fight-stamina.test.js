import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {captureStartingStats} from './fight-starting-stats.js';
import {recoverFightStamina} from './fight-stamina.js';

const baseCombatStats = {agility: 1n, constitution: 1n, durability: 1n, reach: 1n, skill: 1n, stamina: 1n, strength: 1n};

describe('fight-stamina', () => {
  it('does nothing when participant starting stamina metadata is missing', () => {
    const dateNow = Date.now;
    Date.now = () => 1000;
    try {
      const fight = captureStartingStats({
        details: {attacker: {stats: {...baseCombatStats, stamina: 17n}}},
      });
      fight.details.attacker.stats.stamina = 16n;
      fight.details.attacker.startingStats = null;

      Date.now = () => 6000;
      recoverFightStamina(fight);

      assert.equal(fight.details.attacker.stats.stamina, 16n);
    }
    finally {
      Date.now = dateNow;
    }
  });

  it('uses defaults when recovery timestamp or remainder are missing', () => {
    const dateNow = Date.now;
    Date.now = () => 1000;
    try {
      const fight = captureStartingStats({
        details: {attacker: {stats: {...baseCombatStats, stamina: 100n}}},
      });
      fight.details.attacker.stats.stamina = 50n;
      fight.details.attacker.staminaRecoveredAt = 0;
      fight.details.attacker.staminaRecoveryRemainder = null;

      recoverFightStamina(fight);
      assert.equal(fight.details.attacker.stats.stamina, 51n);

      fight.details.attacker.staminaRecoveredAt = null;
      Date.now = () => 6000;
      recoverFightStamina(fight);
      assert.equal(fight.details.attacker.stats.stamina, 51n);
    }
    finally {
      Date.now = dateNow;
    }
  });

  it('recovers stamina from sub-second deltas across updates', () => {
    const dateNow = Date.now;
    Date.now = () => 1000;
    try {
      const fight = captureStartingStats({
        details: {attacker: {stats: {...baseCombatStats, stamina: 200n}}},
      });
      fight.details.attacker.stats.stamina = 100n;

      Date.now = () => 1250;
      recoverFightStamina(fight);
      assert.equal(fight.details.attacker.stats.stamina, 100n);

      Date.now = () => 1500;
      recoverFightStamina(fight);
      assert.equal(fight.details.attacker.stats.stamina, 101n);
    }
    finally {
      Date.now = dateNow;
    }
  });
});
