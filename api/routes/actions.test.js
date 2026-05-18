import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';

import {mockKnex} from '../data/utils/mock-knex.js';
import actionsRoutes from '../routes/actions.js';


describe('GET /actions', () => {
  it('returns list of actions', async () => {
    const {knex} = mockKnex([{id: 1, name: 'Jab', type: 'train'}]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(actionsRoutes);

    const response = await app.inject({method: 'GET', url: '/actions'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), [{id: 1, name: 'Jab', type: 'train'}]);
    await app.close();
  });
});

describe('GET /actions/:id', () => {
  it('returns action when found', async () => {
    const {knex} = mockKnex({id: 1, name: 'Jab', type: 'train'});
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(actionsRoutes);

    const response = await app.inject({method: 'GET', url: '/actions/1'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {id: 1, name: 'Jab', type: 'train'});
    await app.close();
  });

  it('returns 404 when not found', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(actionsRoutes);

    const response = await app.inject({method: 'GET', url: '/actions/999'});

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), {error: 'Not found'});
    await app.close();
  });
});

describe('POST /actions', () => {
  it('creates action and returns 201', async () => {
    const {knex} = mockKnex([{id: 1, name: 'Jab', type: 'train'}]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(actionsRoutes);

    const response = await app.inject({
      method: 'POST',
      payload: {name: 'Jab', type: 'train'},
      url: '/actions',
    });

    assert.equal(response.statusCode, 201);
    assert.deepEqual(response.json(), {id: 1, name: 'Jab', type: 'train'});
    await app.close();
  });
});
