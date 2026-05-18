import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';

import {mockKnex} from '../data/utils/mock-knex.js';
import playersRoutes from '../routes/players.js';


describe('GET /players', () => {
  it('returns list of players', async () => {
    const {knex} = mockKnex([{display_name: 'Test', id: 1}]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(playersRoutes);

    const response = await app.inject({method: 'GET', url: '/players'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), [{display_name: 'Test', id: 1}]);
    await app.close();
  });
});

describe('GET /players/:id', () => {
  it('returns player when found', async () => {
    const {knex} = mockKnex({display_name: 'Test', id: 1});
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(playersRoutes);

    const response = await app.inject({method: 'GET', url: '/players/1'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {display_name: 'Test', id: 1});
    await app.close();
  });

  it('returns 404 when not found', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(playersRoutes);

    const response = await app.inject({method: 'GET', url: '/players/999'});

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), {error: 'Not found'});
    await app.close();
  });
});

describe('POST /players', () => {
  it('returns 404 because player creation endpoint is disabled', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(playersRoutes);

    const response = await app.inject({
      method: 'POST',
      url: '/players',
    });

    assert.equal(response.statusCode, 404);
    await app.close();
  });

  it('returns 404 even with player payload', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(playersRoutes);

    const response = await app.inject({
      method: 'POST',
      payload: {display_name: 'New Player', email: null, password: null},
      url: '/players',
    });

    assert.equal(response.statusCode, 404);
    await app.close();
  });
});
