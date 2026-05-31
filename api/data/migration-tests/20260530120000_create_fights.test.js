import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {down, up} from '../migrations/20260530120000_create_fights.js';


describe('20260530120000_create_fights migration', () => {
  it('creates fights with prize enum column', async () => {
    const calls = [];
    const knex = {
      raw: async (sql) => {
        calls.push(sql);
        return [];
      },
    };

    await up(knex);

    assert.equal(calls.length, 1);
    assert.match(calls[0], /CREATE TYPE fight_prize AS ENUM \('gold', 'rank'\)/);
    assert.match(calls[0], /prize fight_prize NOT NULL/);
  });

  it('drops fights and fight_prize on rollback', async () => {
    const calls = [];
    const knex = {
      raw: async (sql) => {
        calls.push(sql);
        return [];
      },
    };

    await down(knex);

    assert.deepEqual(calls, [
      'DROP TABLE IF EXISTS fights',
      'DROP TYPE IF EXISTS fight_prize',
    ]);
  });
});
