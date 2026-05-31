import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import fightersModel from './fighters.js';
import {mockKnex} from '../utils/mock-knex.js';


describe('fighters.findCurrentByPlayerID', () => {
  it('casts stats and gold to BigInt when reading a current fighter', async () => {
    const {calls, knex} = mockKnex({id: 7, player: 3, retired: false, gold: '9', stats: {speed: '2'}});
    const fighters = fightersModel(knex);

    const result = await fighters.findCurrentByPlayerID(3);

    assert.deepEqual(result, {id: 7, player: 3, retired: false, gold: 9n, stats: {speed: 2n}});
    assert.deepEqual(calls[0], ['table', 'fighters']);
    assert.deepEqual(calls[1], ['where', {player: 3, retired: false}]);
    assert.deepEqual(calls[2], ['orderBy', 'created_at', 'desc']);
    assert.deepEqual(calls[3], ['first']);
  });
});

describe('fighters.read', () => {
  it('casts stats and gold to BigInt in find and list reads', async () => {
    const fighter = {id: 1, gold: '3', stats: {vigor: '4'}};
    const {knex: findKnex} = mockKnex(fighter);
    const {knex: listKnex} = mockKnex([fighter]);
    const fightersForFind = fightersModel(findKnex);
    const fightersForList = fightersModel(listKnex);

    const found = await fightersForFind.find(1);
    const listed = await fightersForList.list();

    assert.deepEqual(found, {id: 1, gold: 3n, stats: {vigor: 4n}});
    assert.deepEqual(listed, [{id: 1, gold: 3n, stats: {vigor: 4n}}]);
  });

  it('defaults missing gold to 0n in reads', async () => {
    const fighter = {id: 1, stats: {vigor: '4'}};
    const {knex: findKnex} = mockKnex(fighter);
    const {knex: listKnex} = mockKnex([fighter]);
    const fightersForFind = fightersModel(findKnex);
    const fightersForList = fightersModel(listKnex);

    const found = await fightersForFind.find(1);
    const listed = await fightersForList.list();

    assert.deepEqual(found, {id: 1, gold: 0n, stats: {vigor: 4n}});
    assert.deepEqual(listed, [{id: 1, gold: 0n, stats: {vigor: 4n}}]);
  });
});

describe('fighters.write', () => {
  it('casts BigInt stats to strings in create and update writes', async () => {
    const createResult = [{id: 1, stats: {vigor: '4'}}];
    const updateResult = [{id: 1, stats: {vigor: '5'}}];
    const {calls: createCalls, knex: createKnex} = mockKnex(createResult);
    const {calls: updateCalls, knex: updateKnex} = mockKnex(updateResult);
    const fightersForCreate = fightersModel(createKnex);
    const fightersForUpdate = fightersModel(updateKnex);

    await fightersForCreate.create({display_name: 'Tiger', stats: {vigor: 4n, speed: 2n}});
    await fightersForUpdate.update(1, {stats: {vigor: 5n, speed: '2'}});

    assert.deepEqual(createCalls[1], ['insert', {display_name: 'Tiger', stats: {vigor: '4', speed: '2'}}]);
    assert.deepEqual(updateCalls[2], ['update', {stats: {vigor: '5', speed: '2'}}]);
  });
});
