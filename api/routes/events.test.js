import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';

import {mockKnex} from '../data/utils/mock-knex.js';
import eventsRoutes from '../routes/events.js';


describe('GET /events', () => {
  it('returns list of events', async () => {
    const {knex} = mockKnex([{character_id: 1, created_at: '2026-01-01T00:00:00.000Z', id: 1, message: 'Trained jab'}]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(eventsRoutes);

    const response = await app.inject({method: 'GET', url: '/events'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), [{character_id: 1, created_at: '2026-01-01T00:00:00.000Z', id: 1, message: 'Trained jab'}]);
    await app.close();
  });
});

describe('GET /events/:id', () => {
  it('returns event when found', async () => {
    const {knex} = mockKnex({character_id: 1, created_at: '2026-01-01T00:00:00.000Z', id: 1, message: 'Trained jab'});
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(eventsRoutes);

    const response = await app.inject({method: 'GET', url: '/events/1'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), {character_id: 1, created_at: '2026-01-01T00:00:00.000Z', id: 1, message: 'Trained jab'});
    await app.close();
  });

  it('returns 404 when not found', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(eventsRoutes);

    const response = await app.inject({method: 'GET', url: '/events/999'});

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), {error: 'Not found'});
    await app.close();
  });
});

describe('POST /events', () => {
  it('returns 404', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(eventsRoutes);

    const response = await app.inject({
      method: 'POST',
      payload: {character_id: 1, message: 'Trained jab'},
      url: '/events',
    });

    assert.equal(response.statusCode, 404);
    await app.close();
  });
});
