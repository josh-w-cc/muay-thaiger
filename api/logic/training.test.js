import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {applyTraining} from './training.js';

const BASE_STATS = {
  agility: 0n,
  anima: 1n,
  constitution: 0n,
  vigor: 1n,
  skill: 0n,
  speed: 1n,
  stamina: 0n,
  strength: 0n,
  vitality: 1n,
};

describe('applyTraining', () => {
  it('returns the original fighter with empty actions when there are no active actions', async () => {
    const fighter = {id: 1, gold: '0', stats: BASE_STATS};
    const fighterActions = {listByFighterID: async () => []};
    const fighters = {};

    const result = await applyTraining({fighterActions, fighters}, fighter);

    assert.equal(result.fighter, fighter);
    assert.deepEqual(result.actions, []);
  });

  it('applies stamina training for the walking action', async () => {
    const fighter = {id: 1, gold: '0', stats: {...BASE_STATS, vitality: 2n}};
    const actions = [{action: 2, fighter: 1, id: 5, touched_at: getOffsetDate(-1000)}];
    const touchCalls = [];
    const updateCalls = [];
    const fighterActions = {
      listByFighterID: async () => actions,
      touch: async (id) => touchCalls.push(id),
    };
    const fighters = {
      update: async (id, data) => {
        updateCalls.push({data, id});
        return {...fighter, ...data};
      },
    };

    await applyTraining({fighterActions, fighters}, fighter);

    assert.equal(updateCalls.length, 1);
    assert.equal(updateCalls[0].data.stats.stamina, 2n);
  });

  it('updates the fighter stats for multiple active actions', async () => {
    const fighter = {id: 1, gold: '0', stats: {...BASE_STATS, anima: 2n, vitality: 3n}};
    const actions = [
      {action: 2, fighter: 1, id: 5, touched_at: getOffsetDate(-3000)},
      {action: 4, fighter: 1, id: 6, touched_at: getOffsetDate(-3000)},
    ];
    const updateCalls = [];
    const fighterActions = {
      listByFighterID: async () => actions,
      touch: async () => null,
    };
    const fighters = {
      update: async (id, data) => {
        updateCalls.push(data);
        return {...fighter, ...data};
      },
    };

    await applyTraining({fighterActions, fighters}, fighter);

    assert.equal(updateCalls.length, 1);
    assert.equal(updateCalls[0].stats.stamina, 6n);
    assert.equal(updateCalls[0].stats.constitution, 3n);
  });

  it('trains strength using vigor rather than current strength', async () => {
    const fighter = {id: 1, gold: '0', stats: {...BASE_STATS, vigor: 3n, stamina: 120n, strength: 5n}};
    const actions = [{action: 5, fighter: 1, id: 5, touched_at: getOffsetDate(-3000)}];
    const updateCalls = [];
    const fighterActions = {
      listByFighterID: async () => actions,
      touch: async () => null,
    };
    const fighters = {
      update: async (id, data) => {
        updateCalls.push(data);
        return {...fighter, ...data};
      },
    };

    await applyTraining({fighterActions, fighters}, fighter);

    assert.equal(updateCalls.length, 1);
    assert.equal(updateCalls[0].stats.strength, 8n);
  });

  it('touches applied actions using sequential skill timing', async () => {
    const fighter = {id: 1, gold: '0', stats: {...BASE_STATS, strength: 2n, vitality: 2n}};
    const now = Date.now();
    const actions = [
      {action: 3, fighter: 1, id: 5, touched_at: new Date(now - 10000).toISOString()},
      {action: 6, fighter: 1, id: 6, touched_at: new Date(now - 10000).toISOString()},
    ];
    const touchCalls = [];
    const fighterActions = {
      listByFighterID: async () => actions,
      touch: async (id, touchedAt) => touchCalls.push({id, touchedAt}),
    };
    const fighters = {update: async () => ({...fighter})};

    await applyTraining({fighterActions, fighters}, fighter);

    assert.equal(touchCalls.length, 2);
    assert.equal(touchCalls[0].id, 5);
    assert.equal(touchCalls[1].id, 6);
    assert.equal(touchCalls[0].touchedAt.getTime() - touchCalls[1].touchedAt.getTime(), 2000);
    assert.ok(Math.abs(touchCalls[0].touchedAt.getTime() - (now - 2000)) < 500);
    assert.ok(Math.abs(touchCalls[1].touchedAt.getTime() - (now - 4000)) < 500);
  });

  it('touches applied actions by database id after building the shared timeline', async () => {
    const fighter = {id: 1, gold: '0', stats: {...BASE_STATS, vitality: 2n}};
    const actions = [{action: 2, fighter: 1, id: 99, touched_at: getOffsetDate(-1000)}];
    const touchCalls = [];
    const fighterActions = {
      listByFighterID: async () => actions,
      touch: async (id) => touchCalls.push(id),
    };
    const fighters = {update: async () => ({...fighter})};

    await applyTraining({fighterActions, fighters}, fighter);

    assert.deepEqual(touchCalls, [99]);
  });

  it('increases gold for win-type actions', async () => {
    const fighter = {id: 1, gold: 0n, stats: BASE_STATS};
    const actions = [{action: 1, fighter: 1, id: 5, touched_at: getOffsetDate(-1000)}];
    const updateCalls = [];
    const fighterActions = {
      listByFighterID: async () => actions,
      touch: async () => null,
    };
    const fighters = {
      update: async (id, data) => {
        updateCalls.push(data);
        return {...fighter, ...data};
      },
    };

    await applyTraining({fighterActions, fighters}, fighter);

    assert.equal(updateCalls[0].gold, 1n);
  });

  it('uses BigInt arithmetic for large gold values', async () => {
    const fighter = {id: 1, gold: 9007199254740993n, stats: BASE_STATS};
    const actions = [{action: 1, fighter: 1, id: 5, touched_at: getOffsetDate(-1000)}];
    const updateCalls = [];
    const fighterActions = {
      listByFighterID: async () => actions,
      touch: async () => null,
    };
    const fighters = {
      update: async (id, data) => {
        updateCalls.push(data);
        return {...fighter, ...data};
      },
    };

    await applyTraining({fighterActions, fighters}, fighter);

    assert.equal(updateCalls[0].gold, 9007199254740994n);
  });

  it('returns the updated fighter and actions from the fighters model', async () => {
    const fighter = {id: 1, gold: '0', stats: BASE_STATS};
    const updatedFighter = {id: 1, gold: '0', stats: {...BASE_STATS, stamina: 1}};
    const actions = [{action: 2, fighter: 1, id: 5, touched_at: getOffsetDate(-1000)}];
    const fighterActions = {
      listByFighterID: async () => actions,
      touch: async () => null,
    };
    const fighters = {update: async () => updatedFighter};

    const result = await applyTraining({fighterActions, fighters}, fighter);

    assert.equal(result.fighter, updatedFighter);
    assert.equal(result.actions, actions);
  });

  it('skips unknown action IDs without error', async () => {
    const fighter = {id: 1, gold: '0', stats: BASE_STATS};
    const actions = [{action: 999, fighter: 1, id: 5, touched_at: getOffsetDate(-1000)}];
    const updateCalls = [];
    const touchCalls = [];
    const fighterActions = {
      listByFighterID: async () => actions,
      touch: async (id) => touchCalls.push(id),
    };
    const fighters = {
      update: async (id, data) => {
        updateCalls.push(data);
        return {...fighter, ...data};
      },
    };

    await applyTraining({fighterActions, fighters}, fighter);

    assert.equal(touchCalls.length, 0);
    assert.equal(updateCalls[0].stats.stamina, 0n);
  });
});

function getOffsetDate(offsetInMs) {
  return new Date(Date.now() + offsetInMs).toISOString();
}
