import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';

import {mockKnexMulti} from '../data/utils/mock-knex.js';
import {attachFightJudge, FightJudge} from './fight-judge.js';


function validStats() {
  return {
    agility: 11n,
    constitution: 7n,
    durability: 13n,
    reach: 17n,
    skill: 19n,
    stamina: 23n,
    strength: 29n,
  };
}

describe('FightJudge.load', () => {
  it('stores unresolved fights by player ID and discards duplicate player entries', async () => {
    const judge = new FightJudge();
    const firstFight = {
      attacker: 11,
      defender: 12,
      details: {attacker: {stats: validStats()}, defender: {stats: validStats()}},
      id: 101,
      victory: null,
    };
    const secondFight = {
      attacker: 13,
      defender: 14,
      details: {attacker: {stats: validStats()}, defender: {stats: validStats()}},
      id: 102,
      victory: null,
    };
    const thirdFight = {
      attacker: 15,
      defender: null,
      details: {attacker: {stats: validStats()}},
      id: 103,
      victory: null,
    };
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
    const fight = {
      attacker: 11,
      defender: 12,
      details: {attacker: {stats: validStats()}, defender: {stats: validStats()}},
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
            agility: 11n,
            constitution: 7n,
            durability: 13n,
            reach: 17n,
            skill: 19n,
            stamina: 23n,
            strength: 29n,
          },
        },
        defender: {
          starting_stats: {agility: '99', stamina: '99'},
          stats: {
            agility: 31n,
            constitution: 37n,
            durability: 41n,
            reach: 43n,
            skill: 47n,
            stamina: 53n,
            strength: 59n,
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
      attack: 39n,
      defense: 22n,
      health: 637n,
      power: 62n,
    });
    assert.deepEqual(result.details.defender.calculated_stats, {
      attack: 93n,
      defense: 50n,
      health: 56129n,
      power: 122n,
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
            agility: 10n,
            constitution: 11n,
            durability: 12n,
            reach: 13n,
            skill: 14n,
            stamina: 15n,
            strength: 16n,
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
    fight.details.attacker.stats.skill = 60n;
    fight.details.attacker.stats.stamina = 70n;
    const secondAttack = judge.get(1).details.attacker.calculated_stats.attack;

    assert.notEqual(firstAttack, secondAttack);
    assert.equal(
      secondAttack,
      76n,
    );
  });

  it('throws when attacker stats are missing', async () => {
    const judge = new FightJudge();
    const fight = {attacker: 11, details: {attacker: {}}, id: 103, victory: null};
    const fighters = {
      find: async (fighterID) => ({
        11: {id: 11, player: 1},
      }[fighterID] ?? null),
    };

    await judge.attach(fighters, fight);

    assert.throws(
      () => judge.get(1),
      {name: 'TypeError', message: 'invalid-fight-stats'},
    );
  });

  it('throws when defender exists and defender stats are missing', async () => {
    const judge = new FightJudge();
    const fight = {
      attacker: 11,
      defender: 12,
      details: {
        attacker: {
          stats: validStats(),
        },
        defender: {},
      },
      id: 104,
      victory: null,
    };
    const fighters = {
      find: async (fighterID) => ({
        11: {id: 11, player: 1},
        12: {id: 12, player: 2},
      }[fighterID] ?? null),
    };

    await judge.attach(fighters, fight);

    assert.throws(
      () => judge.get(1),
      {name: 'TypeError', message: 'invalid-fight-stats'},
    );
  });
});

describe('attachFightJudge', () => {
  it('loads unresolved fights into app.fightJudge on server ready', async () => {
    const unresolvedFight = {
      attacker: 9,
      defender: null,
      details: {attacker: {stats: validStats()}},
      id: 5,
      victory: null,
    };
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
