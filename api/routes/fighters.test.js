import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';

import {mockKnex} from '../data/utils/mock-knex.js';
import fightersRoutes from '../routes/fighters.js';


describe('GET /fighters', () => {
  it('returns list of fighters', async () => {
    const {knex} = mockKnex([{display_name: 'TestChar', gold: '0', id: 1, player: 1, race: 1, stats: {}}]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(fightersRoutes);

    const response = await app.inject({method: 'GET', url: '/fighters'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), [{display_name: 'TestChar', gold: '0', id: 1, player: 1, race: 1, stats: {}}]);
    await app.close();
  });
});

describe('GET /fighters/:id', () => {
  it('returns fighter when found', async () => {
    const {knex} = mockKnex({display_name: 'TestChar', gold: '0', id: 1, player: 1, race: 1, stats: {}});
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(fightersRoutes);

    const response = await app.inject({method: 'GET', url: '/fighters/1'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {display_name: 'TestChar', gold: '0', id: 1, player: 1, race: 1, stats: {}});
    await app.close();
  });

  it('returns 404 when not found', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(fightersRoutes);

    const response = await app.inject({method: 'GET', url: '/fighters/999'});

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), {error: 'Not found'});
    await app.close();
  });
});

describe('POST /fighters', () => {
  it('returns 404', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(fightersRoutes);

    const response = await app.inject({
      method: 'POST',
      payload: {display_name: 'NewChar', player: 1, race: 1},
      url: '/fighters',
    });

    assert.equal(response.statusCode, 404);
    await app.close();
  });
});
