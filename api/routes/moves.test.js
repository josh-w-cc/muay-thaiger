import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';

import {mockKnex} from '../data/utils/mock-knex.js';
import movesRoutes from './moves.js';


describe('GET /moves', () => {
  it('returns list of moves', async () => {
    const moves = [
      {id: 2, name: 'Wild Kick'},
      {id: 1, name: 'Wild Punch'},
    ];
    const {calls, knex} = mockKnex(moves);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(movesRoutes);

    const response = await app.inject({method: 'GET', url: '/moves'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), moves);
    assert.equal(calls.some((call) => call[0] === 'table' && call[1] === 'moves'), true);
    assert.equal(calls.some((call) => call[0] === 'orderBy' && call[1] === 'name'), true);
    await app.close();
  });
});
