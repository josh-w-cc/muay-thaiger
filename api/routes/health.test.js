import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import healthRoutes from '../routes/health.js';

describe('GET /health', () => {
  it('returns status ok', async () => {
    const app = Fastify();
    await app.register(healthRoutes);

    const response = await app.inject({method: 'GET', url: '/health'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {status: 'ok'});
  });
});
