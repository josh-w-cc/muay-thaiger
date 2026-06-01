import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {down, up} from '../migrations/20260601120000_create_entities.js';


describe('20260601120000_create_entities migration', () => {
  it('creates entities with fighter foreign key', async () => {
    const calls = [];
    const knex = {
      raw: async (sql) => {
        calls.push(sql);
        return [];
      },
    };

    await up(knex);

    assert.equal(calls.length, 1);
    assert.match(calls[0], /CREATE TABLE IF NOT EXISTS entities/);
    assert.match(calls[0], /fighter BIGINT NOT NULL REFERENCES fighters\(id\) ON DELETE CASCADE/);
    assert.match(calls[0], /CREATE OR REPLACE TRIGGER entities_updated_at/);
  });

  it('drops entities on rollback', async () => {
    const calls = [];
    const knex = {
      raw: async (sql) => {
        calls.push(sql);
        return [];
      },
    };

    await down(knex);

    assert.deepEqual(calls, ['DROP TABLE IF EXISTS entities CASCADE']);
  });
});
