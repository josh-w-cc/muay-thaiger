import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import fightersModel from './fighters.js';
import {mockKnex} from '../utils/mock-knex.js';


describe('fighters.create', () => {
  it('casts numeric stats to huge-number strings before insert', async () => {
    const {calls, knex} = mockKnex([{id: 7}]);
    const fighters = fightersModel(knex);

    await fighters.create({
      display_name: 'Test Fighter',
      player_id: 3,
      race: 2,
      stats: {anima: 1, stamina: '10'},
    });

    assert.deepEqual(calls[0], ['table', 'fighters']);
    assert.deepEqual(calls[1], [
      'insert',
      {
        display_name: 'Test Fighter',
        player_id: 3,
        race: 2,
        stats: {anima: '1', stamina: '10'},
      },
    ]);
    assert.deepEqual(calls[2], ['returning', '*']);
  });
});

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

describe('fighters.update', () => {
  it('casts numeric stats to huge-number strings before update', async () => {
    const {calls, knex} = mockKnex([{id: 7}]);
    const fighters = fightersModel(knex);

    await fighters.update(7, {stats: {anima: 1, stamina: '10'}});

    assert.deepEqual(calls[0], ['table', 'fighters']);
    assert.deepEqual(calls[1], ['where', {id: 7}]);
    assert.deepEqual(calls[2], ['update', {stats: {anima: '1', stamina: '10'}}]);
    assert.deepEqual(calls[3], ['returning', '*']);
  });
});
