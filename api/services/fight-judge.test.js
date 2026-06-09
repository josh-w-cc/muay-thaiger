import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';
import patchBigIntPrototype from 'shared/bigInt.js';
import {MOVE_IDS} from 'shared/moves.js';

import {mockKnexMulti} from '../data/utils/mock-knex.js';
import {executeFightMove, markMoveUsed} from './fight-judge-utils.js';
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

describe('executeFightMove', () => {
  it('uses unscaled incoming damage when active participant stats are missing', () => {
    const activeParticipant = {};
    const opponentParticipant = {stats: {health: 10n}};
    const moveDefinition = {affect: (_fighter, opponent) => opponent.takeDamage(2)};

    executeFightMove(moveDefinition, activeParticipant, opponentParticipant);

    assert.equal(opponentParticipant.stats.health, 8n);
  });

  describe('markMoveUsed', () => {
    it('rejects move usage when stamina would drop below zero', () => {
      const dateNow = Date.now;
      Date.now = () => 1000;
      try {
        const move = {lastUsed: 999};
        const moveDefinition = {recovery: 5, staminaCost: 200};
        const activeParticipant = {stats: {stamina: 1n}};

        assert.equal(markMoveUsed(move, moveDefinition, activeParticipant), false);
        assert.equal(activeParticipant.stats.stamina, 1n);
        assert.equal(move.lastUsed, 999);
      }
      finally {
        Date.now = dateNow;
      }
    });

    it('rejects move usage when stamina is already negative', () => {
      const dateNow = Date.now;
      Date.now = () => 1000;
      try {
        const move = {lastUsed: 999};
        const moveDefinition = {recovery: 5, staminaCost: 200};
        const activeParticipant = {stats: {stamina: -1n}};

        assert.equal(markMoveUsed(move, moveDefinition, activeParticipant), false);
        assert.equal(activeParticipant.stats.stamina, -1n);
        assert.equal(move.lastUsed, 999);
      }
      finally {
        Date.now = dateNow;
      }
    });
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

  it('does not attach player mappings for fighters with no player', async () => {
    const judge = new FightJudge();
    const fightersWithMissingPlayer = {
      find: async (fighterID) => ({
        11: {id: 11, player: null},
        12: {id: 12, player: 2},
      }[fighterID] ?? null),
    };
    const fight = {
      attacker: 11, defender: 12, details: {attacker: {stats: {...baseCombatStats}}, defender: {stats: {...baseCombatStats}}}, id: 101, victory: null,
    };

    await judge.attach(fightersWithMissingPlayer, fight);

    assert.equal(judge.get(1), null);
    assert.equal(judge.get(2).id, fight.id);
  });

  describe('FightJudge.move', () => {
    const twoPlayerFighters = {
      find: async (fighterID) => ({
        11: {id: 11, player: 1},
        12: {id: 12, player: 2},
      }[fighterID] ?? null),
    };
    const namedTwoPlayerFighters = {
      find: async (fighterID) => ({
        11: {id: 11, player: 1, display_name: 'Tiger'},
        12: {id: 12, player: 2, display_name: 'Snow Leopard'},
      }[fighterID] ?? null),
    };

    it('updates lastUsed and applies move effects for the active player move', async () => {
      const dateNow = Date.now;
      Date.now = () => 1234567890123;
      try {
        const judge = new FightJudge();
        const fight = {
          attacker: 11,
          defender: 12,
          details: {
            attacker: {moves: [{id: MOVE_IDS.wildPunch, lastUsed: 1}, {id: MOVE_IDS.wildKick, lastUsed: 2}], stats: {...baseCombatStats}},
            defender: {moves: [{id: MOVE_IDS.wildKick, lastUsed: 3}], stats: {...baseCombatStats}},
          },
          id: 101,
          victory: null,
        };

        await judge.attach(twoPlayerFighters, fight);

        assert.equal(judge.move(1, MOVE_IDS.wildKick, 10), true);
        assert.equal(judge.get(1).details.attacker.moves[1].lastUsed, 1234567890123);
        assert.equal(judge.get(1).details.attacker.stats.stamina, 1n);
        assert.deepEqual(judge.get(1).details.attacker.moveList, [10]);
        assert.equal(judge.get(1).details.defender.stats.health, -5n);
        assert.equal(judge.get(2).details.defender.moves[0].lastUsed, 3);
        assert.deepEqual(judge.get(2).details.defender.moveList, []);
      }
      finally {
        Date.now = dateNow;
      }
    });

    it('does not consume stamina when move recovery has elapsed', async () => {
      const dateNow = Date.now;
      Date.now = () => 1000;
      try {
        const judge = new FightJudge();
        const fight = {
          attacker: 11,
          defender: 12,
          details: {
            attacker: {moves: [{id: MOVE_IDS.wildPunch, lastUsed: 997}], stats: {...baseCombatStats, stamina: 10n}},
            defender: {moves: [{id: MOVE_IDS.wildKick, lastUsed: 3}], stats: {...baseCombatStats}},
          },
          id: 101,
          victory: null,
        };

        await judge.attach(twoPlayerFighters, fight);

        assert.equal(judge.move(1, MOVE_IDS.wildPunch, 10), true);
        assert.equal(judge.get(1).details.attacker.stats.stamina, 10n);
      }
      finally {
        Date.now = dateNow;
      }
    });

    it('consumes stamina as a percentage when move is reused inside recovery', async () => {
      const dateNow = Date.now;
      Date.now = () => 1000;
      try {
        const judge = new FightJudge();
        const fight = {
          attacker: 11,
          defender: 12,
          details: {
            attacker: {moves: [{id: MOVE_IDS.wildKick, lastUsed: 999}], stats: {...baseCombatStats, stamina: 11n}},
            defender: {moves: [{id: MOVE_IDS.wildPunch, lastUsed: 3}], stats: {...baseCombatStats}},
          },
          id: 101,
          victory: null,
        };

        await judge.attach(twoPlayerFighters, fight);

        assert.equal(judge.move(1, MOVE_IDS.wildKick, 10), true);
        assert.equal(judge.get(1).details.attacker.stats.stamina, 9n);
      }
      finally {
        Date.now = dateNow;
      }
    });

    it('uses a strict recovery threshold for stamina cost checks', async () => {
      const dateNow = Date.now;
      Date.now = () => 1000;
      try {
        const judge = new FightJudge();
        const fight = {
          attacker: 11,
          defender: 12,
          details: {
            attacker: {
              moves: [{id: MOVE_IDS.wildKick, lastUsed: 995}, {id: MOVE_IDS.wildPunch, lastUsed: 998}],
              stats: {...baseCombatStats, stamina: 10n},
            },
            defender: {moves: [{id: MOVE_IDS.wildPunch, lastUsed: 3}], stats: {...baseCombatStats}},
          },
          id: 101,
          victory: null,
        };

        await judge.attach(twoPlayerFighters, fight);

        assert.equal(judge.move(1, MOVE_IDS.wildKick, 10), true);
        assert.equal(judge.get(1).details.attacker.stats.stamina, 10n);

        assert.equal(judge.move(1, MOVE_IDS.wildPunch, 11), true);
        assert.equal(judge.get(1).details.attacker.stats.stamina, 9n);
      }
      finally {
        Date.now = dateNow;
      }
    });

    it('rejects move execution when stamina is already negative', async () => {
      const dateNow = Date.now;
      Date.now = () => 1000;
      try {
        const judge = new FightJudge();
        const fight = {
          attacker: 11,
          defender: 12,
          details: {
            attacker: {moves: [{id: MOVE_IDS.wildKick, lastUsed: 999}], stats: {...baseCombatStats, stamina: -1n}},
            defender: {moves: [{id: MOVE_IDS.wildPunch, lastUsed: 3}], stats: {...baseCombatStats}},
          },
          id: 101,
          victory: null,
        };

        await judge.attach(twoPlayerFighters, fight);

        assert.equal(judge.move(1, MOVE_IDS.wildKick, 10), false);
        assert.equal(judge.get(1).details.attacker.stats.stamina, -1n);
        assert.equal(judge.get(1).details.attacker.moves[0].lastUsed, 999);
        assert.equal(judge.get(1).details.attacker.moveList.length, 0);
        assert.equal(judge.get(1).details.defender.stats.health, 1n);
      }
      finally {
        Date.now = dateNow;
      }
    });

    it('throws when the player has no active fight move or fight', async () => {
      const judge = new FightJudge();
      const fight = {
        attacker: 11,
        defender: null,
        details: {attacker: {moves: [{id: MOVE_IDS.wildPunch, lastUsed: 1}], stats: {...baseCombatStats}}},
        id: 101,
        victory: null,
      };
      const singlePlayerFighters = {
        find: async (fighterID) => ({
          11: {id: 11, player: 1},
        }[fighterID] ?? null),
      };

      await judge.attach(singlePlayerFighters, fight);

      assert.throws(() => judge.move(1, MOVE_IDS.wildKick, 0), /Unknown move:2/u);
      assert.throws(() => judge.move(999, MOVE_IDS.wildPunch, 0), /No fight for player:999/u);
    });

    it('throws when executing a move with an ID not defined in shared moves', async () => {
      const judge = new FightJudge();
      const fight = {
        attacker: 11,
        defender: 12,
        details: {
          attacker: {moves: [{id: 999, lastUsed: 1}], stats: {...baseCombatStats}},
          defender: {moves: [{id: MOVE_IDS.wildKick, lastUsed: 3}], stats: {...baseCombatStats}},
        },
        id: 101,
        victory: null,
      };

      await judge.attach(twoPlayerFighters, fight);

      assert.throws(() => judge.move(1, 999, 0), /Unknown move:999/u);
    });

    it('discards duplicate moveNum entries', async () => {
      const dateNow = Date.now;
      Date.now = () => 1234567890123;
      try {
        const judge = new FightJudge();
        const fight = {
          attacker: 11,
          defender: 12,
          details: {
            attacker: {moves: [{id: MOVE_IDS.wildKick, lastUsed: 2}], stats: {...baseCombatStats}},
            defender: {moves: [{id: MOVE_IDS.wildKick, lastUsed: 3}], stats: {...baseCombatStats}},
          },
          id: 101,
          victory: null,
        };

        await judge.attach(twoPlayerFighters, fight);

        assert.equal(judge.move(1, MOVE_IDS.wildKick, 10), true);
        assert.equal(judge.move(1, MOVE_IDS.wildKick, 10), false);
        assert.deepEqual(judge.get(1).details.attacker.moveList, [10]);
        assert.equal(judge.get(1).details.defender.stats.health, -5n);
      }
      finally {
        Date.now = dateNow;
      }
    });

    it('adds a feed entry when a move is executed', async () => {
      const judge = new FightJudge();
      const fight = {
        attacker: 11,
        defender: 12,
        details: {
          attacker: {moves: [{id: MOVE_IDS.wildKick, lastUsed: 1}], stats: {...baseCombatStats}},
          defender: {moves: [{id: MOVE_IDS.wildPunch, lastUsed: 2}], stats: {...baseCombatStats}},
        },
        id: 101,
        victory: null,
      };

      await judge.attach(namedTwoPlayerFighters, fight);

      judge.move(1, MOVE_IDS.wildKick, 10);
      assert.deepEqual(judge.get(1).details.feed, [{
        actorRole: 'attacker',
        attacker: 'Tiger',
        isSelf: true,
        move: 'Wild Kick',
        result: '6 damage',
      }]);
      assert.deepEqual(judge.get(2).details.feed, [{
        actorRole: 'attacker',
        attacker: 'Tiger',
        isSelf: false,
        move: 'Wild Kick',
        result: '6 damage',
      }]);

      judge.move(2, MOVE_IDS.wildPunch, 11);
      assert.deepEqual(judge.get(1).details.feed, [
        {
          actorRole: 'attacker',
          attacker: 'Tiger',
          isSelf: true,
          move: 'Wild Kick',
          result: '6 damage',
        },
        {
          actorRole: 'defender',
          attacker: 'Snow Leopard',
          isSelf: false,
          move: 'Wild Punch',
          result: '4 damage',
        },
      ]);
      assert.deepEqual(judge.get(2).details.feed, [
        {
          actorRole: 'attacker',
          attacker: 'Tiger',
          isSelf: false,
          move: 'Wild Kick',
          result: '6 damage',
        },
        {
          actorRole: 'defender',
          attacker: 'Snow Leopard',
          isSelf: true,
          move: 'Wild Punch',
          result: '4 damage',
        },
      ]);
    });
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

    assert.deepEqual(judge.get(1).details.attacker.startingStats, {...attackerStats, health: 1n});
    assert.deepEqual(judge.get(1).details.defender.startingStats, {...defenderStats, health: 1n});
    assert.deepEqual(judge.get(1).details.attacker.moveList, []);
    assert.deepEqual(judge.get(1).details.defender.moveList, []);
    assert.deepEqual(judge.get(1).details.feed, []);
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
    assert.deepEqual(storedFight.details.attacker.stats, {
      agility: 9999n,
      attack: 18n,
      constitution: 2n,
      defense: 13n,
      durability: 3n,
      health: 12n,
      power: 20n,
      reach: 7n,
      skill: 8n,
      stamina: 44n,
      strength: 9n,
    });
    assert.deepEqual(storedFight.details.defender.stats, {
      agility: 111n,
      attack: 10n,
      constitution: 3n,
      defense: 9n,
      durability: 4n,
      health: 36n,
      power: 14n,
      reach: 2n,
      skill: 5n,
      stamina: 22n,
      strength: 6n,
    });
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

    assert.deepEqual(judge.get(1).details.attacker.stats, {
      agility: 111n,
      attack: 18n,
      constitution: 2n,
      defense: 12n,
      durability: 3n,
      health: 12n,
      power: 20n,
      reach: 7n,
      skill: 8n,
      stamina: 44n,
      strength: 9n,
    });

    fight.details.attacker.stats.stamina = 4444n;

    assert.deepEqual(judge.get(1).details.attacker.stats, {
      agility: 111n,
      attack: 20n,
      constitution: 2n,
      defense: 12n,
      durability: 3n,
      health: 12n,
      power: 40n,
      reach: 7n,
      skill: 8n,
      stamina: 4444n,
      strength: 9n,
    });
    assert.deepEqual(judge.get(1).details.attacker.startingStats, {
      agility: 111n,
      constitution: 2n,
      durability: 3n,
      health: 12n,
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

    assert.deepEqual(judge.get(1).details.attacker.startingStats, {...attackerStats, health: 1n});
    assert.deepEqual(judge.get(1).details.attacker.moveList, []);
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
