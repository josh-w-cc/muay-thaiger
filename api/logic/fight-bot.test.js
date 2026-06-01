import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {generateGoldBotStats} from './fight-bot.js';

describe('generateGoldBotStats', () => {
  it('uses the minimum apm when base stats are low', (context) => {
    context.mock.method(Math, 'random', () => 0.5);
    const result = generateGoldBotStats({
      constitution: 1,
      durability: 1,
      reach: 1,
      skill: 1,
      speed: 1,
      stamina: 1,
      vigor: 1,
    });

    assert.deepEqual(result, {
      apm: 4n,
      attack: 4n,
      defense: 3n,
      health: 3n,
      power: 3n,
      stamina: 1n,
    });
  });

  it('uses computed apm when agility and skill are high', (context) => {
    context.mock.method(Math, 'random', () => 0.5);
    const result = generateGoldBotStats({
      constitution: 4,
      durability: 3,
      reach: 5,
      skill: 1000,
      speed: 1000,
      stamina: 200,
      strength: 7,
      vigor: 9,
    });

    assert.deepEqual(result, {
      apm: 8n,
      attack: 1012n,
      defense: 1007n,
      health: 225n,
      power: 4021n,
      stamina: 200n,
    });
  });

  it('falls back to positive defaults when base stats are invalid', (context) => {
    context.mock.method(Math, 'random', () => 0.5);
    const result = generateGoldBotStats({
      constitution: null,
      durability: -5,
      reach: 'abc',
      skill: 0,
      speed: undefined,
      stamina: -2,
      strength: undefined,
      vigor: 2,
    });

    assert.deepEqual(result, {
      apm: 4n,
      attack: 4n,
      defense: 3n,
      health: 3n,
      power: 4n,
      stamina: 1n,
    });
  });
});
