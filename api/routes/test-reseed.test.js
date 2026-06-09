import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';
import {MOVE_IDS} from 'shared/moves.js';
import {SKILL_IDS} from 'shared/skills/index.js';

import {mockKnexMulti} from '../data/utils/mock-knex.js';
import testReseedRoutes from '../routes/test-reseed.js';


describe('POST /api/test/reseed', () => {
  it('truncates tables and reseeds reference data without fighter rows, returns 204', async () => {
    const {knex, calls} = mockKnexMulti([[], [], []], []);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(testReseedRoutes);

    const response = await app.inject({method: 'POST', url: '/test/reseed'});

    assert.equal(response.statusCode, 204);
    assert.equal(calls[0][0], 'raw');
    assert.ok(calls[0][1].includes('TRUNCATE'));
    assert.ok(calls[0][1].includes('fighter_actions'));
    assert.ok(calls[0][1].includes('moves'));
    assert.equal(calls[1][0], 'table');
    assert.equal(calls[1][1], 'moves');
    assert.equal(calls[2][0], 'insert');
    assert.deepEqual(calls[2][1].map(({id}) => id), [
      MOVE_IDS.wildPunch,
      MOVE_IDS.wildKick,
    ]);
    assert.equal(calls[3][0], 'table');
    assert.equal(calls[3][1], 'actions');
    assert.equal(calls[4][0], 'insert');
    assert.deepEqual(
      calls[4][1].map(({id}) => id).toSorted((left, right) => left - right),
      Object.values(SKILL_IDS).toSorted((left, right) => left - right),
    );
    assert.equal(calls[5][0], 'table');
    assert.equal(calls[5][1], 'races');
    assert.equal(calls[6][0], 'insert');
    assert.deepEqual(
      calls
        .filter(([type]) => type === 'table')
        .map(([, table]) => table),
      ['moves', 'actions', 'races'],
    );
    await app.close();
  });
});
