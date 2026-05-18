import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import characterActionsModel from './fighter-actions.js';
import {mockKnexMulti} from '../utils/mock-knex.js';


describe('characterActions.list', () => {
  it('lists actions for the player current non-retired character', async () => {
    const currentCharacter = {id: 7, player_id: 3, retired: false};
    const actions = [{action_id: 2, character_id: 7, id: 1}];
    const {calls, knex} = mockKnexMulti([currentCharacter, actions]);
    const characterActions = characterActionsModel(knex);

    const result = await characterActions.list(3);

    assert.deepEqual(result, actions);
    assert.deepEqual(calls[0], ['table', 'fighters']);
    assert.deepEqual(calls[1], ['where', {player_id: 3, retired: false}]);
    assert.deepEqual(calls[2], ['orderBy', 'created_at', 'desc']);
    assert.deepEqual(calls[3], ['first']);
    assert.deepEqual(calls[4], ['table', 'fighter_actions']);
    assert.deepEqual(calls[5], ['where', {character_id: 7}]);
    assert.deepEqual(calls[6], ['orderBy', 'created_at']);
  });

  it('returns an empty list when the player has no current character', async () => {
    const {calls, knex} = mockKnexMulti([undefined]);
    const characterActions = characterActionsModel(knex);

    const result = await characterActions.list(3);

    assert.deepEqual(result, []);
    assert.deepEqual(calls[0], ['table', 'fighters']);
    assert.deepEqual(calls[1], ['where', {player_id: 3, retired: false}]);
    assert.deepEqual(calls[2], ['orderBy', 'created_at', 'desc']);
    assert.deepEqual(calls[3], ['first']);
  });
});
