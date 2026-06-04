import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {down, up} from '../migrations/20260523120001_create_fighter_moves.js';
import createMockKnex from './mock-knex.js';


describe('20260523120001_create_fighter_moves migration', () => {
  it('creates fighter_moves with fighter/move foreign keys and enabled default false', async () => {
    const {calls, knex} = createMockKnex();

    await up(knex);

    assert.equal(calls.length, 1);
    assert.match(calls[0], /CREATE TABLE IF NOT EXISTS fighter_moves/);
    assert.match(calls[0], /fighter BIGINT NOT NULL REFERENCES fighters\(id\) ON DELETE CASCADE/);
    assert.match(calls[0], /move BIGINT NOT NULL REFERENCES moves\(id\) ON DELETE CASCADE/);
    assert.match(calls[0], /enabled BOOLEAN NOT NULL DEFAULT FALSE/);
  });

  it('drops fighter_moves on rollback', async () => {
    const {calls, knex} = createMockKnex();

    await down(knex);

    assert.deepEqual(calls, ['DROP TABLE IF EXISTS fighter_moves']);
  });
});
