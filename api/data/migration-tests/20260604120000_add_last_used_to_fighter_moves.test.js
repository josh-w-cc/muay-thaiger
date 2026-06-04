import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {down, up} from '../migrations/20260604120000_add_last_used_to_fighter_moves.js';
import createMockKnex from './mock-knex.js';


describe('20260604120000_add_last_used_to_fighter_moves migration', () => {
  it('adds last_used column to fighter_moves', async () => {
    const {calls, knex} = createMockKnex();

    await up(knex);

    assert.equal(calls.length, 1);
    assert.match(calls[0], /ALTER TABLE fighter_moves ADD COLUMN last_used TIMESTAMPTZ/);
  });

  it('drops last_used column on rollback', async () => {
    const {calls, knex} = createMockKnex();

    await down(knex);

    assert.deepEqual(calls, ['ALTER TABLE fighter_moves DROP COLUMN last_used']);
  });
});
