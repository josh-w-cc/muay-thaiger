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
    const {calls, knex} = mockKnex({id: 1, attacker: 1, defender: 2, victor: null, details: {}});
    const fights = fightsModel(knex);

    await fights.find(1);

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['where', {id: 1}]);
    assert.deepEqual(calls[2], ['first']);
  });
});

describe('fights.create', () => {
  it('inserts a fight and returns the created row', async () => {
    const fight = {attacker: 1, defender: 2, reason: 'gold', details: {}};
    const {calls, knex} = mockKnex({id: 1, victor: null, ...fight});
    const fights = fightsModel(knex);

    await fights.create(fight);

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['insert', fight]);
    assert.deepEqual(calls[2], ['returning', '*']);
  });
});

describe('fights.update', () => {
  it('updates a fight by id and returns the updated row', async () => {
    const {calls, knex} = mockKnex({id: 1, attacker: 1, defender: 2, victor: true, details: {}});
    const fights = fightsModel(knex);

    await fights.update(1, {victor: true});

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['where', {id: 1}]);
    assert.deepEqual(calls[2], ['update', {victor: true}]);
    assert.deepEqual(calls[3], ['returning', '*']);
  });
});
