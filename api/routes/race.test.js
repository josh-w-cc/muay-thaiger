import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';

import {mockKnex} from '../data/utils/mock-knex.js';
import raceRoutes from '../routes/race.js';


describe('GET /race', () => {
  it('returns list of races', async () => {
    const races = [
      {id: 2, name: 'Snow Leopard', stats: {}},
      {id: 1, name: 'Tiger', stats: {}},
    ];
    const {calls, knex} = mockKnex(races);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(raceRoutes);

    const response = await app.inject({method: 'GET', url: '/race'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), races);
    assert.equal(calls.some((call) => call[0] === 'table' && call[1] === 'races'), true);
    assert.equal(calls.some((call) => call[0] === 'orderBy' && call[1] === 'name'), true);
    await app.close();
  });
});
