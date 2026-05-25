import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import fightersModel from './fighters.js';
import {mockKnex} from '../utils/mock-knex.js';


describe('fighters.findCurrentByPlayerID', () => {
  it('finds the latest non-retired fighter for a player', async () => {
    const {calls, knex} = mockKnex({id: 7, player_id: 3, retired: false});
    const fighters = fightersModel(knex);

    await fighters.findCurrentByPlayerID(3);

    assert.deepEqual(calls[0], ['table', 'fighters']);
    assert.deepEqual(calls[1], ['where', {player_id: 3, retired: false}]);
    assert.deepEqual(calls[2], ['orderBy', 'created_at', 'desc']);
    assert.deepEqual(calls[3], ['first']);
  });
});

describe('fighter BigInt serialization', () => {
  it('serializes BigInt gold and stats when creating fighters', async () => {
    const fighterRow = {gold: '500', id: 7, stats: {stamina: '3'}};
    const {calls, knex} = mockKnex([fighterRow]);
    const fighters = fightersModel(knex);

    const createdFighter = await fighters.create({
      display_name: 'BigTiger',
      gold: 500n,
      player_id: 3,
      race: 1,
      stats: {stamina: 3n},
    });

    assert.deepEqual(calls[1], ['insert', {
      display_name: 'BigTiger',
      gold: '500',
      player_id: 3,
      race: 1,
      stats: {stamina: '3'},
    }]);
    assert.equal(createdFighter.gold, 500n);
    assert.equal(createdFighter.stats.stamina, 3n);
  });
});
