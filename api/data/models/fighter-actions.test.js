import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import fighterActionsModel from './fighter-actions.js';
import {mockKnex, mockKnexMulti} from '../utils/mock-knex.js';


describe('fighterActions.list', () => {
  it('lists actions for the player current non-retired fighter', async () => {
    const currentFighter = {id: 7, player_id: 3, retired: false};
    const actions = [{action_id: 2, fighter_id: 7, id: 1}];
    const {calls, knex} = mockKnexMulti([currentFighter, actions]);
    const fighterActions = fighterActionsModel(knex);

    const result = await fighterActions.list(3);

    assert.deepEqual(result, actions);
    assert.deepEqual(calls[0], ['table', 'fighters']);
    assert.deepEqual(calls[1], ['where', {player_id: 3, retired: false}]);
    assert.deepEqual(calls[2], ['orderBy', 'created_at', 'desc']);
    assert.deepEqual(calls[3], ['first']);
    assert.deepEqual(calls[4], ['table', 'fighter_actions']);
    assert.deepEqual(calls[5], ['where', {fighter_id: 7}]);
    assert.deepEqual(calls[6], ['orderBy', 'created_at']);
  });

  it('returns an empty list when the player has no current fighter', async () => {
    const {calls, knex} = mockKnexMulti([undefined]);
    const fighterActions = fighterActionsModel(knex);

    const result = await fighterActions.list(3);

    assert.deepEqual(result, []);
    assert.deepEqual(calls[0], ['table', 'fighters']);
    assert.deepEqual(calls[1], ['where', {player_id: 3, retired: false}]);
    assert.deepEqual(calls[2], ['orderBy', 'created_at', 'desc']);
    assert.deepEqual(calls[3], ['first']);
  });
});

describe('fighterActions.listByFighterID', () => {
  it('lists actions for the given fighter ID', async () => {
    const actions = [{action_id: 2, fighter_id: 7, id: 1}];
    const {calls, knex} = mockKnex(actions);
    const fighterActions = fighterActionsModel(knex);

    const result = await fighterActions.listByFighterID(7);

    assert.deepEqual(result, actions);
    assert.deepEqual(calls[0], ['table', 'fighter_actions']);
    assert.deepEqual(calls[1], ['where', {fighter_id: 7}]);
    assert.deepEqual(calls[2], ['orderBy', 'created_at']);
  });
});

describe('fighterActions.touch', () => {
  it('updates touched_at for the given fighter action ID', async () => {
    const updated = {id: 5, action_id: 2, fighter_id: 7, touched_at: '2026-05-20T00:00:00.000Z'};
    const {calls, knex} = mockKnex([updated]);
    knex.fn = {now: () => 'NOW()'};
    const fighterActions = fighterActionsModel(knex);

    const result = await fighterActions.touch(5);

    assert.deepEqual(result, updated);
    assert.deepEqual(calls[0], ['table', 'fighter_actions']);
    assert.deepEqual(calls[1], ['where', {id: 5}]);
    assert.deepEqual(calls[2], ['update', {touched_at: 'NOW()'}]);
    assert.deepEqual(calls[3], ['returning', '*']);
  });
});
