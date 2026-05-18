import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';

import {mockKnex} from '../data/utils/mock-knex.js';
import playerID from './player-id.js';


describe('playerIDMiddleware', () => {
  it('sets req.playerId from a bearer token', async () => {
    const {knex} = mockKnex({id: 42});
    const app = Fastify();
    app.decorate('db', knex);
    await playerID(app);
    app.get('/player-id', async (req) => ({playerId: req.playerId}));

    const response = await app.inject({
      headers: {authorization: 'Bearer player-token'},
      method: 'GET',
      url: '/player-id',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {playerId: 42});
    await app.close();
  });

  it('leaves req.playerId null when authorization header is missing', async () => {
    const {knex} = mockKnex({id: 42});
    const app = Fastify();
    app.decorate('db', knex);
    await playerID(app);
    app.get('/player-id', async (req) => ({playerId: req.playerId}));

    const response = await app.inject({method: 'GET', url: '/player-id'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {playerId: null});
    await app.close();
  });

  it('leaves req.playerId null for non-bearer authorization values', async () => {
    const {knex} = mockKnex({id: 42});
    const app = Fastify();
    app.decorate('db', knex);
    await playerID(app);
    app.get('/player-id', async (req) => ({playerId: req.playerId}));

    const response = await app.inject({
      headers: {authorization: 'Token player-token'},
      method: 'GET',
      url: '/player-id',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {playerId: null});
    await app.close();
  });
});
