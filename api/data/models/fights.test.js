import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import fightsModel from './fights.js';
import {mockKnex} from '../utils/mock-knex.js';


describe('fights.list', () => {
  it('lists fights ordered by created_at', async () => {
    const {calls, knex} = mockKnex([]);
    const fights = fightsModel(knex);

    await fights.list();

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['orderBy', 'created_at']);
  });
});

describe('fights.find', () => {
  it('finds a fight by id', async () => {
    const {calls, knex} = mockKnex({id: 1, attacker: 1, defender: 2, victory: null, details: {}});
    const fights = fightsModel(knex);

    await fights.find(1);

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['where', {id: 1}]);
    assert.deepEqual(calls[2], ['first']);
  });
});

describe('fights.findActiveByFighterID', () => {
  it('finds the latest unresolved fight for the fighter as attacker or defender', async () => {
    const {calls, knex} = mockKnex({id: 1, attacker: 7, defender: 2, victory: null, details: {}});
    const fights = fightsModel(knex);

    await fights.findActiveByFighterID(7);

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['whereNull', 'victory']);
    assert.deepEqual(calls[2], ['whereRaw', '(attacker = ? OR defender = ?)', [7, 7]]);
    assert.deepEqual(calls[3], ['orderBy', 'created_at', 'desc']);
    assert.deepEqual(calls[4], ['first']);
  });

  it('returns the unresolved fight when the fighter is the defender', async () => {
    const {calls, knex} = mockKnex({id: 2, attacker: 1, defender: 7, victory: null, details: {}});
    const fights = fightsModel(knex);

    const fight = await fights.findActiveByFighterID(7);

    assert.deepEqual(fight, {attacker: 1, defender: 7, details: {}, id: 2, victory: null});
    assert.equal(calls[0][0], 'table');
  });
});

describe('fights.create', () => {
  it('inserts a fight and returns the created row', async () => {
    const fight = {attacker: 1, defender: 2, reason: 'gold', details: {}, rank: 'bronze'};
    const {calls, knex} = mockKnex({id: 1, victory: null, ...fight});
    const fights = fightsModel(knex);

    await fights.create(fight);

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['insert', fight]);
    assert.deepEqual(calls[2], ['returning', '*']);
  });
});

describe('fights.update', () => {
  it('updates a fight by id and returns the updated row', async () => {
    const {calls, knex} = mockKnex({id: 1, attacker: 1, defender: 2, victory: true, details: {}});
    const fights = fightsModel(knex);

    await fights.update(1, {victory: true});

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['where', {id: 1}]);
    assert.deepEqual(calls[2], ['update', {victory: true}]);
    assert.deepEqual(calls[3], ['returning', '*']);
  });
});
