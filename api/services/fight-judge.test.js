import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';
import patchBigIntPrototype from 'shared/bigInt.js';

import {mockKnexMulti} from '../data/utils/mock-knex.js';
import {attachFightJudge, FightJudge} from './fight-judge.js';

patchBigIntPrototype();

const baseCombatStats = {agility: 1n, constitution: 1n, durability: 1n, reach: 1n, skill: 1n, stamina: 1n, strength: 1n};

describe('FightJudge.load', () => {
  it('stores unresolved fights by player ID and discards duplicate player entries', async () => {
    const judge = new FightJudge();
    const firstFight = {
      attacker: 11, defender: 12, details: {attacker: {stats: {...baseCombatStats}}, defender: {stats: {...baseCombatStats}}}, id: 101, victory: null,
    };
    const secondFight = {
      attacker: 13, defender: 14, details: {attacker: {stats: {...baseCombatStats}}, defender: {stats: {...baseCombatStats}}}, id: 102, victory: null,
    };
    const thirdFight = {attacker: 15, defender: null, details: {attacker: {stats: {...baseCombatStats}}}, id: 103, victory: null};
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

    assert.equal(judge.get(1).id, secondFight.id);
    assert.equal(judge.get(2).id, firstFight.id);
    assert.equal(judge.get(3).id, secondFight.id);
    assert.equal(judge.get(4).id, thirdFight.id);
    assert.equal(judge.get(999), null);
  });
});

describe('FightJudge.attach', () => {
  const twoPlayerFighters = {
    find: async (fighterID) => ({
      11: {id: 11, player: 1},
      12: {id: 12, player: 2},
    }[fighterID] ?? null),
  };

  it('stores a new unresolved fight by all participant player IDs', async () => {
    const judge = new FightJudge();
    const fight = {
      attacker: 11, defender: 12, details: {attacker: {stats: {...baseCombatStats}}, defender: {stats: {...baseCombatStats}}}, id: 101, victory: null,
    };

    await judge.attach(twoPlayerFighters, fight);

    assert.equal(judge.get(1).id, fight.id);
    assert.equal(judge.get(2).id, fight.id);
  });

  it('captures attacker and defender starting stats from fight details', async () => {
    const judge = new FightJudge();
    const attackerStats = {...baseCombatStats, agility: 10n, stamina: 5n};
    const defenderStats = {...baseCombatStats, agility: 8n, stamina: 3n};
    const fight = {
      attacker: 11,
      defender: 12,
      details: {
        attacker: {stats: attackerStats},
        defender: {stats: defenderStats},
      },
      id: 101,
      victory: null,
    };

    await judge.attach(twoPlayerFighters, fight);

    assert.deepEqual(judge.get(1).details.attacker.startingStats, attackerStats);
    assert.deepEqual(judge.get(1).details.defender.startingStats, defenderStats);
  });

  it('computes calculated attacker and defender stats from current fight details', async () => {
    const judge = new FightJudge();
    const fight = {
      attacker: 11,
      defender: 12,
      details: {
        attacker: {stats: {agility: 9999n, constitution: 2n, durability: 3n, reach: 7n, skill: 8n, stamina: 44n, strength: 9n}},
        defender: {stats: {agility: 111n, constitution: 3n, durability: 4n, reach: 2n, skill: 5n, stamina: 22n, strength: 6n}},
      },
      id: 101,
      victory: null,
    };

    await judge.attach(twoPlayerFighters, fight);

    const storedFight = judge.get(1);
    assert.deepEqual(storedFight.details.attacker.calculatedStats, {attack: 18n, defense: 13n, health: 12n, power: 20n});
    assert.deepEqual(storedFight.details.defender.calculatedStats, {attack: 10n, defense: 9n, health: 36n, power: 14n});
  });

  it('recalculates calculated stats from updated current fight details on each get', async () => {
    const judge = new FightJudge();
    const fight = {
      attacker: 11,
      defender: null,
      details: {
        attacker: {stats: {agility: 111n, constitution: 2n, durability: 3n, reach: 7n, skill: 8n, stamina: 44n, strength: 9n}},
      },
      id: 101,
      victory: null,
    };

    await judge.attach(twoPlayerFighters, fight);

    assert.deepEqual(judge.get(1).details.attacker.calculatedStats, {attack: 18n, defense: 12n, health: 12n, power: 20n});

    fight.details.attacker.stats.stamina = 4444n;

    assert.deepEqual(judge.get(1).details.attacker.calculatedStats, {attack: 20n, defense: 12n, health: 12n, power: 40n});
    assert.deepEqual(judge.get(1).details.attacker.startingStats, {
      agility: 111n,
      constitution: 2n,
      durability: 3n,
      reach: 7n,
      skill: 8n,
      stamina: 44n,
      strength: 9n,
    });
  });

  it('omits defender from stored fight when fight has no defender details', async () => {
    const judge = new FightJudge();
    const attackerStats = {...baseCombatStats, agility: 10n, stamina: 5n};
    const fight = {
      attacker: 11,
      defender: null,
      details: {attacker: {stats: attackerStats}},
      id: 101,
      victory: null,
    };
    const singlePlayerFighters = {
      find: async (fighterID) => ({
        11: {id: 11, player: 1},
      }[fighterID] ?? null),
    };

    await judge.attach(singlePlayerFighters, fight);

    assert.deepEqual(judge.get(1).details.attacker.startingStats, attackerStats);
    assert.equal('defender' in judge.get(1).details, false);
  });
});

describe('attachFightJudge', () => {
  it('loads unresolved fights into app.fightJudge on server ready', async () => {
    const unresolvedFight = {attacker: 9, defender: null, details: {attacker: {stats: {...baseCombatStats}}}, id: 5, victory: null};
    const {knex} = mockKnexMulti([
      [unresolvedFight],
      {id: 9, player: 4},
    ]);
    const app = Fastify();
    app.decorate('db', knex);

    attachFightJudge(app);
    await app.ready();

    assert.equal(app.fightJudge.get(4).id, unresolvedFight.id);
    await app.close();
  });
});
