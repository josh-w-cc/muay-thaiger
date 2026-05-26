import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import fightersModel from './fighters.js';
import {mockKnex} from '../utils/mock-knex.js';


describe('fighters.findCurrentByPlayerID', () => {
  it('finds the latest non-retired fighter for a player', async () => {
    const {calls, knex} = mockKnex({id: 7, player: 3, retired: false});
    const fighters = fightersModel(knex);

    await fighters.findCurrentByPlayerID(3);

    assert.deepEqual(calls[0], ['table', 'fighters']);
    assert.deepEqual(calls[1], ['where', {player: 3, retired: false}]);
    assert.deepEqual(calls[2], ['orderBy', 'created_at', 'desc']);
    assert.deepEqual(calls[3], ['first']);
  });
});
