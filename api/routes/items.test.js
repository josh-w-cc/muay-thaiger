import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';

import {mockKnex} from '../data/utils/mock-knex.js';
import itemsRoutes from '../routes/items.js';


describe('GET /items', () => {
  it('returns list of items', async () => {
    const {knex} = mockKnex([{id: 1, name: 'Test'}]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(itemsRoutes);

    const response = await app.inject({method: 'GET', url: '/items'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), [{id: 1, name: 'Test'}]);
    await app.close();
  });
});

describe('GET /items/:id', () => {
  it('returns item when found', async () => {
    const {knex} = mockKnex({id: 1, name: 'Test'});
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(itemsRoutes);

    const response = await app.inject({method: 'GET', url: '/items/1'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {id: 1, name: 'Test'});
    await app.close();
  });

  it('returns 404 when not found', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(itemsRoutes);

    const response = await app.inject({method: 'GET', url: '/items/999'});

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), {error: 'Not found'});
    await app.close();
  });
});

describe('POST /items', () => {
  it('creates item and returns 201', async () => {
    const {knex} = mockKnex([{id: 1, name: 'New Item'}]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(itemsRoutes);

    const response = await app.inject({
      method: 'POST',
      payload: {name: 'New Item'},
      url: '/items',
    });

    assert.equal(response.statusCode, 201);
    assert.deepEqual(response.json(), {id: 1, name: 'New Item'});
    await app.close();
  });
});
