import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';

import {mockKnex, mockKnexMulti} from '../data/utils/mock-knex.js';
import fightsRoutes from '../routes/fights.js';


const sampleFight = {
  attacker: 1,
  created_at: '2026-01-01T00:00:00.000Z',
  defender: 2,
  details: {},
  id: 1,
  reason: 'gold',
  updated_at: '2026-01-01T00:00:00.000Z',
  victor: null,
};

describe('GET /fights', () => {
  it('returns list of fights', async () => {
    const {knex} = mockKnex([sampleFight]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(fightsRoutes);

    const response = await app.inject({method: 'GET', url: '/fights'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), [sampleFight]);
    await app.close();
  });
});

describe('GET /fights/:id', () => {
  it('returns fight when found', async () => {
    const {knex} = mockKnex(sampleFight);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(fightsRoutes);

    const response = await app.inject({method: 'GET', url: '/fights/1'});

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), sampleFight);
    await app.close();
  });

  it('returns 404 when not found', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(fightsRoutes);

    const response = await app.inject({method: 'GET', url: '/fights/999'});

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), {error: 'Not found'});
    await app.close();
  });
});

describe('POST /fights', () => {
  it('creates a fight and returns 201', async () => {
    const {knex} = mockKnex([sampleFight]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(fightsRoutes);

    const response = await app.inject({
      method: 'POST',
      payload: {attacker: 1, defender: 2, reason: 'gold', details: {}},
      url: '/fights',
    });

    assert.equal(response.statusCode, 201);
    assert.deepEqual(response.json(), sampleFight);
    await app.close();
  });

  it('creates a fight with no defender (robot)', async () => {
    const fightNoDefender = {...sampleFight, defender: null};
    const {knex} = mockKnex([fightNoDefender]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(fightsRoutes);

    const response = await app.inject({
      method: 'POST',
      payload: {attacker: 1, reason: 'rank', details: {}},
      url: '/fights',
    });

    assert.equal(response.statusCode, 201);
    assert.deepEqual(response.json(), fightNoDefender);
    await app.close();
  });
});

describe('PATCH /fights/:id', () => {
  it('updates fight victor and returns updated fight', async () => {
    const updatedFight = {...sampleFight, victor: true};
    const {knex} = mockKnexMulti([sampleFight, [updatedFight]]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(fightsRoutes);

    const response = await app.inject({
      method: 'PATCH',
      payload: {victor: true},
      url: '/fights/1',
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), updatedFight);
    await app.close();
  });

  it('returns 404 when fight not found', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(fightsRoutes);

    const response = await app.inject({
      method: 'PATCH',
      payload: {victor: 1},
      url: '/fights/999',
    });

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), {error: 'Not found'});
    await app.close();
  });
});
