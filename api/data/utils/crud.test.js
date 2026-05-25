import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {
  generateCreateFn,
  generateFindFn,
  generateListFn,
  generateRemoveFn,
  generateSearchFn,
  generateUpdateFn,
} from './crud.js';
import {mockKnex} from './mock-knex.js';


describe('generateCreateFn', () => {
  it('inserts data and returns the first row', async () => {
    const {calls, knex} = mockKnex([{id: 1, name: 'Test'}]);
    const create = generateCreateFn(knex, 'items');

    const result = await create({name: 'Test'});

    assert.deepEqual(result, {id: 1, name: 'Test'});
    assert.deepEqual(calls[0], ['table', 'items']);
    assert.deepEqual(calls[1], ['insert', {name: 'Test'}]);
    assert.deepEqual(calls[2], ['returning', '*']);
  });

  it('transforms the input before insert when a transformer is provided', async () => {
    const {calls, knex} = mockKnex([{id: 1, name: 'Test'}]);
    const create = generateCreateFn(knex, 'items', (data) => ({...data, status: 'active'}));

    await create({name: 'Test'});

    assert.deepEqual(calls[1], ['insert', {name: 'Test', status: 'active'}]);
  });
});

describe('generateFindFn', () => {
  it('finds a record by id', async () => {
    const {calls, knex} = mockKnex({id: 1});
    const find = generateFindFn(knex, 'items');

    await find(1);

    assert.deepEqual(calls[0], ['table', 'items']);
    assert.deepEqual(calls[1], ['where', {id: 1}]);
    assert.deepEqual(calls[2], ['first']);
  });
});

describe('generateListFn', () => {
  it('lists records with direction', async () => {
    const {calls, knex} = mockKnex([]);
    const list = generateListFn(knex, 'items', 'name', 'asc');

    await list();

    assert.deepEqual(calls[0], ['table', 'items']);
    assert.deepEqual(calls[1], ['orderBy', 'name', 'asc']);
  });

  it('lists records without direction', async () => {
    const {calls, knex} = mockKnex([]);
    const list = generateListFn(knex, 'items', 'name');

    await list();

    assert.deepEqual(calls[0], ['table', 'items']);
    assert.deepEqual(calls[1], ['orderBy', 'name']);
  });
});

describe('generateRemoveFn', () => {
  it('deletes a record by id', async () => {
    const {calls, knex} = mockKnex(1);
    const remove = generateRemoveFn(knex, 'items');

    await remove(1);

    assert.deepEqual(calls[0], ['table', 'items']);
    assert.deepEqual(calls[1], ['where', {id: 1}]);
    assert.deepEqual(calls[2], ['del']);
  });
});

describe('generateSearchFn', () => {
  it('searches records by params', async () => {
    const {calls, knex} = mockKnex([]);
    const search = generateSearchFn(knex, 'items');

    await search({name: 'Test'});

    assert.deepEqual(calls[0], ['table', 'items']);
    assert.deepEqual(calls[1], ['where', {name: 'Test'}]);
  });
});

describe('generateUpdateFn', () => {
  it('updates a record and returns the first row', async () => {
    const {calls, knex} = mockKnex([{id: 1, name: 'Updated'}]);
    const update = generateUpdateFn(knex, 'items');

    const result = await update(1, {name: 'Updated'});

    assert.deepEqual(result, {id: 1, name: 'Updated'});
    assert.deepEqual(calls[0], ['table', 'items']);
    assert.deepEqual(calls[1], ['where', {id: 1}]);
    assert.deepEqual(calls[2], ['update', {name: 'Updated'}]);
    assert.deepEqual(calls[3], ['returning', '*']);
  });

  it('transforms the input before update when a transformer is provided', async () => {
    const {calls, knex} = mockKnex([{id: 1, name: 'Updated'}]);
    const update = generateUpdateFn(knex, 'items', (data) => ({...data, status: 'active'}));

    await update(1, {name: 'Updated'});

    assert.deepEqual(calls[2], ['update', {name: 'Updated', status: 'active'}]);
  });
});
