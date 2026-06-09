import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {seed} from './001-fighters.js';


describe('001-fighters seed', () => {
  it('seeds reference tables without inserting fighters or players', async () => {
    const calls = [];
    const knex = (table) => {
      calls.push(['table', table]);
      return {
        insert(data) {
          calls.push(['insert', data]);
          return {
            onConflict(column) {
              calls.push(['onConflict', column]);
              return {
                ignore() {
                  calls.push(['ignore']);
                  return Promise.resolve();
                },
              };
            },
          };
        },
      };
    };
    knex.raw = async (...args) => {
      calls.push(['raw', ...args]);
      return {rowCount: 0, rows: []};
    };

    await seed(knex);

    assert.deepEqual(
      calls
        .filter(([type]) => type === 'table')
        .map(([, table]) => table),
      ['moves', 'actions', 'races'],
    );
    const sequenceResets = calls
      .filter(([type]) => type === 'raw')
      .map((call) => call[2][0]);
    assert.deepEqual(
      sequenceResets,
      ['actions', 'moves', 'races'],
    );
  });
});
