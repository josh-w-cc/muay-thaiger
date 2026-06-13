import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {down, up} from '../migrations/20260217120003_create_fighters.js';
import createMockKnex from './mock-knex.js';


describe('20260217120003_create_fighters migration', () => {
  it('creates fighters with details/stats jsonb defaults', async () => {
    const {calls, knex} = createMockKnex();

    await up(knex);

    assert.equal(calls.length, 1);
    assert.match(calls[0], /CREATE TABLE IF NOT EXISTS fighters/);
    assert.match(calls[0], /details JSONB NOT NULL DEFAULT '\{\}'::JSONB/);
    assert.match(calls[0], /stats JSONB NOT NULL DEFAULT '\{\}'::JSONB/);
  });

  it('drops fighters on rollback', async () => {
    const {calls, knex} = createMockKnex();

    await down(knex);

    assert.deepEqual(calls, ['DROP TABLE IF EXISTS fighters CASCADE']);
  });
});
