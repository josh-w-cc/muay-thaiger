import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {down, up} from '../migrations/20260531120000_add_rank_to_fights.js';


describe('20260531120000_add_rank_to_fights migration', () => {
  it('adds rank column to fights table', async () => {
    const calls = [];
    const knex = {
      raw: async (sql) => {
        calls.push(sql);
        return [];
      },
    };

    await up(knex);

    assert.deepEqual(calls, ['ALTER TABLE fights ADD COLUMN IF NOT EXISTS rank TEXT']);
  });

  it('drops rank column on rollback', async () => {
    const calls = [];
    const knex = {
      raw: async (sql) => {
        calls.push(sql);
        return [];
      },
    };

    await down(knex);

    assert.deepEqual(calls, ['ALTER TABLE fights DROP COLUMN IF EXISTS rank']);
  });
});
