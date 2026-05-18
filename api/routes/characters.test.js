import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';

import {mockKnex} from '../data/utils/mock-knex.js';
import charactersRoutes from '../routes/characters.js';


describe('GET /characters', () => {
  it('returns list of characters', async () => {
    const {knex} = mockKnex([{display_name: 'TestChar', gold: '0', id: 1, player_id: 1, race: 1}]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(charactersRoutes);

    const response = await app.inject({method: 'GET', url: '/characters'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), [{display_name: 'TestChar', gold: '0', id: 1, player_id: 1, race: 1}]);
    await app.close();
  });
});

describe('GET /characters/:id', () => {
  it('returns character when found', async () => {
    const {knex} = mockKnex({display_name: 'TestChar', gold: '0', id: 1, player_id: 1, race: 1});
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(charactersRoutes);

    const response = await app.inject({method: 'GET', url: '/characters/1'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {display_name: 'TestChar', gold: '0', id: 1, player_id: 1, race: 1});
    await app.close();
  });

  it('returns 404 when not found', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(charactersRoutes);

    const response = await app.inject({method: 'GET', url: '/characters/999'});

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), {error: 'Not found'});
    await app.close();
  });
});

describe('POST /characters', () => {
  it('returns 404', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(charactersRoutes);

    const response = await app.inject({
      method: 'POST',
      payload: {display_name: 'NewChar', player_id: 1, race: 1},
      url: '/characters',
    });

    assert.equal(response.statusCode, 404);
    await app.close();
  });
});
