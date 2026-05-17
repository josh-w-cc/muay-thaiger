import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {down, up} from './20260217120002_create_races.js';


describe('20260217120002_create_races migration', () => {
  it('runs up migration SQL', async () => {
    const calls = [];
    const knex = {
      raw(sql) {
        calls.push(sql);
        return Promise.resolve();
      },
    };

    await up(knex);

    assert.equal(calls.length, 1);
    assert.match(calls[0], /CREATE TABLE IF NOT EXISTS races/);
  });

  it('drops races table on down migration', async () => {
    const calls = [];
    const knex = {
      raw(sql) {
        calls.push(sql);
        return Promise.resolve();
      },
    };

    await down(knex);

    assert.deepEqual(calls, ['DROP TABLE IF EXISTS races CASCADE']);
  });
});
