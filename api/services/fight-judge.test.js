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

    assert.equal(judge.get(1), firstFight);
    assert.equal(judge.get(2), firstFight);
    assert.equal(judge.get(3), secondFight);
    assert.equal(judge.get(4), thirdFight);
    assert.equal(judge.get(999), null);
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

    assert.equal(judge.get(1), fight);
    assert.equal(judge.get(2), fight);
  });
});

describe('FightJudge.get', () => {
  it('returns calculated stats for attacker and defender based on current stats', async () => {
    const judge = new FightJudge();
    const fight = {
      attacker: 11,
      defender: 12,
      details: {
        attacker: {
          starting_stats: {agility: '99', stamina: '99'},
          stats: {
            agility: '11',
            constitution: '7',
            durability: '13',
            reach: '17',
            skill: '19',
            stamina: '23',
            strength: '29',
          },
        },
        defender: {
          starting_stats: {agility: '99', stamina: '99'},
          stats: {
            agility: '31',
            constitution: '37',
            durability: '41',
            reach: '43',
            skill: '47',
            stamina: '53',
            strength: '59',
          },
        },
      },
      id: 101,
      victory: null,
    };
    const fighters = {
      find: async (fighterID) => ({
        11: {id: 11, player: 1},
        12: {id: 12, player: 2},
      }[fighterID] ?? null),
    };

    await judge.attach(fighters, fight);

    const result = judge.get(1);

    assert.deepEqual(result.details.attacker.calculated_stats, {
      attack: 19 + Math.log(23) + Math.log(Math.log(11)) + 17,
      defense: 19 + Math.log(11) + Math.log(Math.log(23)),
      health: 7 * 7 * 13,
      power: (29 + Math.log(19)) * Math.log(23),
    });
    assert.deepEqual(result.details.defender.calculated_stats, {
      attack: 47 + Math.log(53) + Math.log(Math.log(31)) + 43,
      defense: 47 + Math.log(31) + Math.log(Math.log(53)),
      health: 37 * 37 * 41,
      power: (59 + Math.log(47)) * Math.log(53),
    });
  });

  it('recalculates stats on each request using current stats', async () => {
    const judge = new FightJudge();
    const fight = {
      attacker: 11,
      details: {
        attacker: {
          starting_stats: {
            agility: '200',
            constitution: '200',
            durability: '200',
            reach: '200',
            skill: '200',
            stamina: '200',
            strength: '200',
          },
          stats: {
            agility: '10',
            constitution: '11',
            durability: '12',
            reach: '13',
            skill: '14',
            stamina: '15',
            strength: '16',
          },
        },
      },
      id: 102,
      victory: null,
    };
    const fighters = {
      find: async (fighterID) => ({
        11: {id: 11, player: 1},
      }[fighterID] ?? null),
    };

    await judge.attach(fighters, fight);

    const firstAttack = judge.get(1).details.attacker.calculated_stats.attack;
    fight.details.attacker.stats.skill = '60';
    fight.details.attacker.stats.stamina = '70';
    const secondAttack = judge.get(1).details.attacker.calculated_stats.attack;

    assert.notEqual(firstAttack, secondAttack);
    assert.equal(
      secondAttack,
      60 + Math.log(70) + Math.log(Math.log(10)) + 13,
    );
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

    assert.equal(app.fightJudge.get(4), unresolvedFight);
    await app.close();
  });
});
