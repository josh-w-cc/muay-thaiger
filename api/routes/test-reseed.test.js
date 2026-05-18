import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';

import {mockKnexMulti} from '../data/utils/mock-knex.js';
import testReseedRoutes from '../routes/test-reseed.js';


describe('POST /api/test/reseed', () => {
  it('truncates tables and reseeds data, returns 204', async () => {
    const {knex, calls} = mockKnexMulti([[], [], []], []);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(testReseedRoutes);

    const response = await app.inject({method: 'POST', url: '/test/reseed'});

    assert.equal(response.statusCode, 204);
    assert.equal(calls[0][0], 'raw');
    assert.ok(calls[0][1].includes('TRUNCATE'));
    assert.equal(calls[1][0], 'table');
    assert.equal(calls[1][1], 'players');
    assert.equal(calls[2][0], 'insert');
    assert.equal(calls[3][0], 'table');
    assert.equal(calls[3][1], 'statics');
    assert.equal(calls[4][0], 'insert');
    assert.equal(calls[5][0], 'table');
    assert.equal(calls[5][1], 'characters');
    assert.equal(calls[6][0], 'insert');
    await app.close();
  });
});
