import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';

import {mockKnexMulti} from '../data/utils/mock-knex.js';
import {attachFightJudge, FightJudge} from './fight-judge.js';


describe('FightJudge.load', () => {
  it('stores unresolved fights by player ID and discards duplicate player entries', async () => {
    const judge = new FightJudge();
    const firstFight = {attacker: 11, defender: 12, id: 101, victory: null};
    const secondFight = {attacker: 13, defender: 14, id: 102, victory: null};
    const thirdFight = {attacker: 15, defender: null, id: 103, victory: null};
    const fighters = {
      find: async (fighterID) => ({
        11: {id: 11, player: 1},
        12: {id: 12, player: 2},
        13: {id: 13, player: 1},
        14: {id: 14, player: 3},
        15: {id: 15, player: 4},
      }[fighterID] ?? null),
    };
    const fights = {listUnresolved: async () => [firstFight, secondFight, thirdFight]};

    await judge.load({fighters, fights});

    assert.equal(await judge.get(1), firstFight);
    assert.equal(await judge.get(2), firstFight);
    assert.equal(await judge.get(3), secondFight);
    assert.equal(await judge.get(4), thirdFight);
    assert.equal(await judge.get(999), null);
  });

  it('returns per-request calculated stats from current fighter values', async () => {
    const judge = new FightJudge();
    const fight = {
      attacker: 11,
      defender: 12,
      details: {
        attacker: {
          moves: [1],
          race: 1,
          stats: {
            agility: 10n,
            constitution: 10n,
            durability: 10n,
            reach: 10n,
            skill: 10n,
            stamina: 10n,
            strength: 10n,
          },
        },
        defender: {
          moves: [2],
          race: 2,
          stats: {
            agility: 20n,
            constitution: 20n,
            durability: 20n,
            reach: 20n,
            skill: 20n,
            stamina: 20n,
            strength: 20n,
          },
        },
      },
      id: 101,
      victory: null,
    };
    const fighterRows = {
      11: {
        id: 11,
        player: 1,
        stats: {
          agility: 1000000n,
          constitution: 3n,
          durability: 5n,
          reach: 7n,
          skill: 11n,
          stamina: 1000n,
          strength: 17n,
        },
      },
      12: {
        id: 12,
        player: 2,
        stats: {
          agility: 100n,
          constitution: 4n,
          durability: 6n,
          reach: 2n,
          skill: 5n,
          stamina: 10n,
          strength: 7n,
        },
      },
    };
    const fighters = {
      find: async (fighterID) => fighterRows[fighterID] ?? null,
    };
    const fights = {listUnresolved: async () => [fight]};

    await judge.load({fighters, fights});

    const firstResult = await judge.get(1);
    assert.notEqual(firstResult, fight);
    assert.deepEqual(firstResult.details.attacker, {
      attack: 23n,
      defense: 19n,
      health: 45n,
      moves: [1],
      power: 76n,
      race: 1,
      stats: {
        agility: 10n,
        constitution: 10n,
        durability: 10n,
        reach: 10n,
        skill: 10n,
        stamina: 10n,
        strength: 10n,
      },
    });
    assert.deepEqual(firstResult.details.defender, {
      attack: 10n,
      defense: 9n,
      health: 96n,
      moves: [2],
      power: 16n,
      race: 2,
      stats: {
        agility: 20n,
        constitution: 20n,
        durability: 20n,
        reach: 20n,
        skill: 20n,
        stamina: 20n,
        strength: 20n,
      },
    });

    fighterRows[11] = {
      ...fighterRows[11],
      stats: {
        agility: 10000000000n,
        constitution: 2n,
        durability: 3n,
        reach: 1n,
        skill: 20n,
        stamina: 10000n,
        strength: 1000n,
      },
    };

    const secondResult = await judge.get(1);
    assert.equal(secondResult.details.attacker.attack, 28n);
    assert.equal(secondResult.details.attacker.defense, 32n);
    assert.equal(secondResult.details.attacker.health, 12n);
    assert.equal(secondResult.details.attacker.power, 5010n);
  });
});

describe('FightJudge.attach', () => {
  it('stores a new unresolved fight by all participant player IDs', async () => {
    const judge = new FightJudge();
    const fight = {attacker: 11, defender: 12, id: 101, victory: null};
    const fighters = {
      find: async (fighterID) => ({
        11: {id: 11, player: 1},
        12: {id: 12, player: 2},
      }[fighterID] ?? null),
    };

    await judge.attach(fighters, fight);

    assert.equal(await judge.get(1), fight);
    assert.equal(await judge.get(2), fight);
  });
});

describe('attachFightJudge', () => {
  it('loads unresolved fights into app.fightJudge on server ready', async () => {
    const unresolvedFight = {attacker: 9, defender: null, id: 5, victory: null};
    const {knex} = mockKnexMulti([
      [unresolvedFight],
      {id: 9, player: 4},
    ]);
    const app = Fastify();
    app.decorate('db', knex);

    attachFightJudge(app);
    await app.ready();

    assert.equal(await app.fightJudge.get(4), unresolvedFight);
    await app.close();
  });
});
