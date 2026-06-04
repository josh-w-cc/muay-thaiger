import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import fighterMovesModel from './fighter-moves.js';
import {mockKnex} from '../utils/mock-knex.js';


describe('fighterMoves.listEnabledByFighterID', () => {
  it('lists enabled moves for a fighter ordered by move id', async () => {
    const moves = [{enabled: true, fighter: 7, move: 1}, {enabled: true, fighter: 7, move: 2}];
    const {calls, knex} = mockKnex(moves);
    const fighterMoves = fighterMovesModel(knex);

    const result = await fighterMoves.listEnabledByFighterID(7);

    assert.deepEqual(result, moves);
    assert.deepEqual(calls[0], ['table', 'fighter_moves']);
    assert.deepEqual(calls[1], ['where', {enabled: true, fighter: 7}]);
    assert.deepEqual(calls[2], ['orderBy', 'move']);
  });
});
