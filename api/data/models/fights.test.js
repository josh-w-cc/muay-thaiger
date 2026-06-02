import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import fightsModel from './fights.js';
import {mockKnex, mockKnexMulti} from '../utils/mock-knex.js';


describe('fights.list', () => {
  it('lists fights ordered by created_at', async () => {
    const {calls, knex} = mockKnex([]);
    const fights = fightsModel(knex);

    await fights.list();

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['orderBy', 'created_at']);
  });
});

describe('fights.find', () => {
  it('finds a fight by id', async () => {
    const {calls, knex} = mockKnex({id: 1, attacker: 1, defender: 2, victory: null, details: {}});
    const fights = fightsModel(knex);

    await fights.find(1);

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['where', {id: 1}]);
    assert.deepEqual(calls[2], ['first']);
  });
});

describe('fights.findActiveByFighterID', () => {
  it('finds the latest unresolved fight for the fighter as attacker or defender', async () => {
    const {calls, knex} = mockKnex({id: 1, attacker: 7, defender: 2, victory: null, details: {}});
    const fights = fightsModel(knex);

    await fights.findActiveByFighterID(7);

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['whereNull', 'victory']);
    assert.deepEqual(calls[2], ['whereRaw', '(attacker = ? OR defender = ?)', [7, 7]]);
    assert.deepEqual(calls[3], ['orderBy', 'created_at', 'desc']);
    assert.deepEqual(calls[4], ['first']);
  });

  it('returns the unresolved fight when the fighter is the defender', async () => {
    const {calls, knex} = mockKnex({id: 2, attacker: 1, defender: 7, victory: null, details: {}});
    const fights = fightsModel(knex);

    const fight = await fights.findActiveByFighterID(7);

    assert.deepEqual(fight, {attacker: 1, defender: 7, details: {}, id: 2, victory: null});
    assert.equal(calls[0][0], 'table');
  });
});

describe('fights.create', () => {
  it('inserts a fight with captured starting stats and returns the created row', async () => {
    const fight = {
      attacker: {id: 1, stats: {speed: 10n, vigor: 9}},
      defender: {id: 2, stats: {speed: '8', vigor: 7n}},
      rank: 'bronze',
      reason: 'gold',
    };
    const createdFight = {
      id: 1,
      attacker: 1,
      defender: 2,
      details: {
        attacker: {
          starting_stats: {speed: '10', vigor: '9'},
          stats: {speed: '10', vigor: '9'},
        },
        defender: {
          starting_stats: {speed: '8', vigor: '7'},
          stats: {speed: '8', vigor: '7'},
        },
      },
      rank: 'bronze',
      reason: 'gold',
      victory: null,
    };
    const {calls, knex} = mockKnexMulti([[createdFight], [{player: 88}, {player: 99}]]);
    const fights = fightsModel(knex);

    const result = await fights.create(fight);

    const expectedFightInsert = {
      attacker: 1,
      defender: 2,
      details: {
        attacker: {
          starting_stats: {speed: '10', vigor: '9'},
          stats: {speed: '10', vigor: '9'},
        },
        defender: {
          starting_stats: {speed: '8', vigor: '7'},
          stats: {speed: '8', vigor: '7'},
        },
      },
      rank: 'bronze',
      reason: 'gold',
    };

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['insert', expectedFightInsert]);
    assert.deepEqual(calls[2], ['returning', '*']);
    assert.deepEqual(result, createdFight);
    assert.deepEqual(fights.findActiveByPlayerID(88), createdFight);
    assert.deepEqual(fights.findActiveByPlayerID(99), createdFight);
  });

  it('throws when attacker stats are missing', async () => {
    const {knex} = mockKnex({id: 1});
    const fights = fightsModel(knex);

    await assert.rejects(
      fights.create({attacker: {id: 1}, reason: 'gold'}),
      {name: 'TypeError', message: 'invalid-fight-stats'},
    );
  });
});

describe('fights.update', () => {
  it('updates a fight by id and returns the updated row', async () => {
    const updatedFight = {id: 1, attacker: 1, defender: 2, victory: true, details: {}};
    const {calls, knex} = mockKnexMulti([[updatedFight]]);
    const fights = fightsModel(knex);

    const result = await fights.update(1, {victory: true});

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['where', {id: 1}]);
    assert.deepEqual(calls[2], ['update', {victory: true}]);
    assert.deepEqual(calls[3], ['returning', '*']);
    assert.deepEqual(result, updatedFight);
  });

  it('stores unresolved updates by player id', async () => {
    const updatedFight = {id: 1, attacker: 1, defender: null, victory: null, details: {}};
    const {knex} = mockKnexMulti([[updatedFight], [{player: 88}]]);
    const fights = fightsModel(knex);

    await fights.update(1, {victory: null});

    assert.deepEqual(fights.findActiveByPlayerID(88), updatedFight);
  });
});

describe('fights.loadActiveByPlayerID', () => {
  it('loads unresolved fights into memory keyed by player id and discards duplicates', async () => {
    const newestFight = {
      attacker: 1,
      attacker_player: 55,
      created_at: '2026-06-02T00:00:00.000Z',
      defender: null,
      defender_player: null,
      details: {},
      id: 9,
      reason: 'gold',
      victory: null,
    };
    const olderFight = {
      attacker: 2,
      attacker_player: 55,
      created_at: '2026-06-01T00:00:00.000Z',
      defender: null,
      defender_player: null,
      details: {},
      id: 8,
      reason: 'gold',
      victory: null,
    };
    const defenderFight = {
      attacker: 2,
      attacker_player: 66,
      created_at: '2026-05-31T00:00:00.000Z',
      defender: 3,
      defender_player: 77,
      details: {},
      id: 7,
      reason: 'rank',
      victory: null,
    };
    const {calls, knex} = mockKnex([newestFight, olderFight, defenderFight]);
    const fights = fightsModel(knex);

    await fights.loadActiveByPlayerID();

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['leftJoin', 'fighters as attacker_fighter', 'attacker_fighter.id', 'fights.attacker']);
    assert.deepEqual(calls[2], ['leftJoin', 'fighters as defender_fighter', 'defender_fighter.id', 'fights.defender']);
    assert.deepEqual(calls[3], ['select', 'fights.*', 'attacker_fighter.player as attacker_player', 'defender_fighter.player as defender_player']);
    assert.deepEqual(calls[4], ['whereNull', 'fights.victory']);
    assert.deepEqual(calls[5], ['orderBy', 'fights.created_at', 'desc']);
    assert.deepEqual(fights.findActiveByPlayerID(55), {
      attacker: 1,
      created_at: '2026-06-02T00:00:00.000Z',
      defender: null,
      details: {},
      id: 9,
      reason: 'gold',
      victory: null,
    });
    assert.deepEqual(fights.findActiveByPlayerID(77), {
      attacker: 2,
      created_at: '2026-05-31T00:00:00.000Z',
      defender: 3,
      details: {},
      id: 7,
      reason: 'rank',
      victory: null,
    });
  });
});
