import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import fightsModel from './fights.js';
import {mockKnex} from '../utils/mock-knex.js';


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

describe('fights.listUnresolved', () => {
  it('lists unresolved fights ordered by newest first', async () => {
    const {calls, knex} = mockKnex([{id: 1, victory: null, details: {}}]);
    const fights = fightsModel(knex);

    await fights.listUnresolved();

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['whereNull', 'victory']);
    assert.deepEqual(calls[2], ['orderBy', 'created_at', 'desc']);
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
      attacker: {id: 1, race: 1, stats: {speed: 10n, vigor: 9}},
      defender: {id: 2, race: 2, stats: {speed: '8', vigor: 7n}},
      rank: 'bronze',
      reason: 'gold',
    };
    const {calls, knex} = mockKnex({id: 1, victory: null, ...fight});
    const fights = fightsModel(knex);

    await fights.create(fight);

    const expectedFightInsert = {
      attacker: 1,
      defender: 2,
      details: {
        attacker: {
          race: 1,
          starting_stats: {speed: '10', vigor: '9'},
          stats: {speed: '10', vigor: '9'},
        },
        defender: {
          race: 2,
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
  });

  it('inserts only attacker details when defender is missing', async () => {
    const fight = {
      attacker: {id: 1, race: 1, stats: {speed: 10n, vigor: 9}},
      defender: null,
      rank: '',
      reason: 'rank',
    };
    const {calls, knex} = mockKnex({id: 1, victory: null, ...fight});
    const fights = fightsModel(knex);

    await fights.create(fight);

    assert.deepEqual(calls[1], ['insert', {
      attacker: 1,
      defender: null,
      details: {
        attacker: {
          race: 1,
          starting_stats: {speed: '10', vigor: '9'},
          stats: {speed: '10', vigor: '9'},
        },
      },
      rank: '',
      reason: 'rank',
    }]);
  });

  it('throws when attacker stats are missing', () => {
    const {knex} = mockKnex({id: 1});
    const fights = fightsModel(knex);

    assert.throws(
      () => fights.create({attacker: {id: 1}, reason: 'gold'}),
      {name: 'TypeError', message: 'invalid-fight-stats'},
    );
  });

  it('throws when attacker is missing', () => {
    const {knex} = mockKnex({id: 1});
    const fights = fightsModel(knex);

    assert.throws(
      () => fights.create({attacker: null, reason: 'gold'}),
      {name: 'TypeError', message: 'invalid-fight-stats'},
    );
  });

  it('throws when attacker race is missing', () => {
    const {knex} = mockKnex({id: 1});
    const fights = fightsModel(knex);

    assert.throws(
      () => fights.create({
        attacker: {id: 1, stats: {speed: 10}},
        defender: {id: 2, race: 2, stats: {speed: 8}},
        reason: 'gold',
      }),
      {name: 'TypeError', message: 'invalid-fight-stats'},
    );
  });

  it('throws when defender race is missing', () => {
    const {knex} = mockKnex({id: 1});
    const fights = fightsModel(knex);

    assert.throws(
      () => fights.create({
        attacker: {id: 1, race: 1, stats: {speed: 10}},
        defender: {id: 2, stats: {speed: 8}},
        reason: 'gold',
      }),
      {name: 'TypeError', message: 'invalid-fight-stats'},
    );
  });

  it('throws when defender stats are blank', () => {
    const {knex} = mockKnex({id: 1});
    const fights = fightsModel(knex);

    assert.throws(
      () => fights.create({
        attacker: {id: 1, race: 1, stats: {speed: 10}},
        defender: {id: 2, race: 2, stats: {}},
        reason: 'gold',
      }),
      {name: 'TypeError', message: 'invalid-fight-stats'},
    );
  });
});

describe('fights.update', () => {
  it('updates a fight by id and returns the updated row', async () => {
    const {calls, knex} = mockKnex({id: 1, attacker: 1, defender: 2, victory: true, details: {}});
    const fights = fightsModel(knex);

    await fights.update(1, {victory: true});

    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[1], ['where', {id: 1}]);
    assert.deepEqual(calls[2], ['update', {victory: true}]);
    assert.deepEqual(calls[3], ['returning', '*']);
  });
});
