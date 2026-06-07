import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import fightsModel from './fights/index.js';
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

describe('fights.read', () => {
  it('casts attacker and defender stats to BigInt in find and list reads', async () => {
    const fight = {
      id: 1,
      details: {
        attacker: {stats: {speed: '10'}},
        defender: {stats: {vigor: '9'}},
      },
    };
    const {knex: findKnex} = mockKnex(fight);
    const {knex: listKnex} = mockKnex([fight]);
    const fightsForFind = fightsModel(findKnex);
    const fightsForList = fightsModel(listKnex);

    const found = await fightsForFind.find(1);
    const listed = await fightsForList.list();

    assert.deepEqual(found.details.attacker.stats, {speed: 10n});
    assert.deepEqual(found.details.defender.stats, {vigor: 9n});
    assert.deepEqual(listed[0].details.attacker.stats, {speed: 10n});
    assert.deepEqual(listed[0].details.defender.stats, {vigor: 9n});
  });

  it('casts attacker and defender stats to BigInt in unresolved and active fight reads', async () => {
    const fight = {
      id: 1,
      details: {
        attacker: {stats: {speed: '10'}},
        defender: {stats: {vigor: '9'}},
      },
      victory: null,
    };
    const {knex: unresolvedKnex} = mockKnex([fight]);
    const {knex: activeKnex} = mockKnex(fight);
    const fightsForUnresolved = fightsModel(unresolvedKnex);
    const fightsForActive = fightsModel(activeKnex);

    const unresolved = await fightsForUnresolved.listUnresolved();
    const active = await fightsForActive.findActiveByFighterID(1);

    assert.deepEqual(unresolved[0].details.attacker.stats, {speed: 10n});
    assert.deepEqual(unresolved[0].details.defender.stats, {vigor: 9n});
    assert.deepEqual(active.details.attacker.stats, {speed: 10n});
    assert.deepEqual(active.details.defender.stats, {vigor: 9n});
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
  it('returns attacker and defender stats as BigInt', async () => {
    const createdFight = {
      id: 1,
      details: {
        attacker: {stats: {speed: '10'}},
        defender: {stats: {vigor: '9'}},
      },
    };
    const {knex} = mockKnex([createdFight]);
    const fights = fightsModel(knex);

    const result = await fights.create({
      attacker: {id: 1, race: 1, stats: {speed: 10}},
      defender: {id: 2, race: 2, stats: {vigor: 9}},
      reason: 'gold',
    });

    assert.deepEqual(result.details.attacker.stats, {speed: 10n});
    assert.deepEqual(result.details.defender.stats, {vigor: 9n});
  });

  it('inserts a fight with captured stats and returns the created row', async () => {
    const fight = {
      attacker: {id: 1, moves: [1, 2], race: 1, stats: {speed: 10n, vigor: 9}},
      defender: {id: 2, moves: [2], race: 2, stats: {speed: '8', vigor: 7n}},
      rank: 'bronze',
      reason: 'gold',
    };
    const {calls, knex} = mockKnex({id: 1, victory: null, ...fight});
    const fights = fightsModel(knex);

    await fights.create(fight);

    const inserted = calls[1][1];
    assert.deepEqual(calls[0], ['table', 'fights']);
    assert.deepEqual(calls[2], ['returning', '*']);
    assert.equal(inserted.attacker, 1);
    assert.equal(inserted.defender, 2);
    assert.equal(inserted.rank, 'bronze');
    assert.equal(inserted.reason, 'gold');
    assert.deepEqual(inserted.details.attacker.moves, [1, 2]);
    assert.equal(inserted.details.attacker.race, 1);
    assert.deepEqual(inserted.details.attacker.stats, {speed: '10', vigor: '9'});
    assert.equal(typeof inserted.details.attacker.seed, 'number');
    assert.ok(inserted.details.attacker.seed >= 0);
    assert.ok(inserted.details.attacker.seed < 2 ** 32);
    assert.deepEqual(inserted.details.defender.moves, [2]);
    assert.equal(inserted.details.defender.race, 2);
    assert.deepEqual(inserted.details.defender.stats, {speed: '8', vigor: '7'});
    assert.equal(inserted.details.rank, 'bronze');
    assert.equal(typeof inserted.details.defender.seed, 'number');
    assert.ok(inserted.details.defender.seed >= 0);
    assert.ok(inserted.details.defender.seed < 2 ** 32);
  });

  it('inserts only attacker details when defender is missing', async () => {
    const fight = {
      attacker: {id: 1, moves: [1], race: 1, stats: {speed: 10n, vigor: 9}},
      defender: null,
      rank: '',
      reason: 'rank',
    };
    const {calls, knex} = mockKnex({id: 1, victory: null, ...fight});
    const fights = fightsModel(knex);

    await fights.create(fight);

    const inserted = calls[1][1];
    assert.equal(inserted.attacker, 1);
    assert.equal(inserted.defender, null);
    assert.equal(inserted.rank, '');
    assert.equal(inserted.reason, 'rank');
    assert.deepEqual(inserted.details.attacker.moves, [1]);
    assert.equal(inserted.details.attacker.race, 1);
    assert.deepEqual(inserted.details.attacker.stats, {speed: '10', vigor: '9'});
    assert.equal(typeof inserted.details.attacker.seed, 'number');
    assert.ok(inserted.details.attacker.seed >= 0);
    assert.ok(inserted.details.attacker.seed < 2 ** 32);
    assert.equal(inserted.details.defender, undefined);
    assert.equal(inserted.details.rank, 'ZZ');
  });

  it('throws when attacker stats are missing', async () => {
    const {knex} = mockKnex({id: 1});
    const fights = fightsModel(knex);

    await assert.rejects(
      fights.create({attacker: {id: 1}, reason: 'gold'}),
      {name: 'TypeError', message: 'invalid-fight-stats'},
    );
  });

  it('throws when attacker is missing', async () => {
    const {knex} = mockKnex({id: 1});
    const fights = fightsModel(knex);

    await assert.rejects(
      fights.create({attacker: null, reason: 'gold'}),
      {name: 'TypeError', message: 'invalid-fight-stats'},
    );
  });

  it('throws when attacker race is missing', async () => {
    const {knex} = mockKnex({id: 1});
    const fights = fightsModel(knex);

    await assert.rejects(
      fights.create({
        attacker: {id: 1, stats: {speed: 10}},
        defender: {id: 2, race: 2, stats: {speed: 8}},
        reason: 'gold',
      }),
      {name: 'TypeError', message: 'invalid-fight-stats'},
    );
  });

  it('throws when defender race is missing', async () => {
    const {knex} = mockKnex({id: 1});
    const fights = fightsModel(knex);

    await assert.rejects(
      fights.create({
        attacker: {id: 1, race: 1, stats: {speed: 10}},
        defender: {id: 2, stats: {speed: 8}},
        reason: 'gold',
      }),
      {name: 'TypeError', message: 'invalid-fight-stats'},
    );
  });

  it('throws when defender stats are blank', async () => {
    const {knex} = mockKnex({id: 1});
    const fights = fightsModel(knex);

    await assert.rejects(
      fights.create({
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
