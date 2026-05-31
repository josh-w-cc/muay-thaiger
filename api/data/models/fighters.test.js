import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import fightersModel from './fighters.js';
import {mockKnex} from '../utils/mock-knex.js';


describe('fighters.findCurrentByPlayerID', () => {
  it('casts stats to BigInt when reading a current fighter', async () => {
    const {calls, knex} = mockKnex({id: 7, player: 3, retired: false, stats: {speed: '2'}});
    const fighters = fightersModel(knex);

    const result = await fighters.findCurrentByPlayerID(3);

    assert.deepEqual(result, {id: 7, player: 3, retired: false, stats: {speed: 2n}});
    assert.deepEqual(calls[0], ['table', 'fighters']);
    assert.deepEqual(calls[1], ['where', {player: 3, retired: false}]);
    assert.deepEqual(calls[2], ['orderBy', 'created_at', 'desc']);
    assert.deepEqual(calls[3], ['first']);
  });
});

describe('fighters.read', () => {
  it('casts stats to BigInt in find and list reads', async () => {
    const fighter = {id: 1, stats: {vigor: '4'}};
    const {knex: findKnex} = mockKnex(fighter);
    const {knex: listKnex} = mockKnex([fighter]);
    const fightersForFind = fightersModel(findKnex);
    const fightersForList = fightersModel(listKnex);

    const found = await fightersForFind.find(1);
    const listed = await fightersForList.list();

    assert.deepEqual(found, {id: 1, stats: {vigor: 4n}});
    assert.deepEqual(listed, [{id: 1, stats: {vigor: 4n}}]);
  });
});
