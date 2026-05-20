import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {applyTraining} from './training.js';

const BASE_STATS = {agility: 0, anima: 1, constitution: 0, skill: 0, speed: 1, stamina: 0, strength: 1, vitality: 1};

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
    const fighter = {id: 1, gold: '0', stats: {...BASE_STATS, vitality: 2}};
    const actions = [{action_id: 2, fighter_id: 1, id: 5}];
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
    assert.equal(updateCalls[0].data.stats.stamina, 2);
  });

  it('updates the fighter stats for multiple active actions', async () => {
    const fighter = {id: 1, gold: '0', stats: {...BASE_STATS, anima: 2, vitality: 3}};
    const actions = [
      {action_id: 2, fighter_id: 1, id: 5},
      {action_id: 4, fighter_id: 1, id: 6},
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
    assert.equal(updateCalls[0].stats.stamina, 6);
    assert.equal(updateCalls[0].stats.constitution, 3);
  });

  it('touches all active fighter actions after applying training', async () => {
    const fighter = {id: 1, gold: '0', stats: BASE_STATS};
    const actions = [
      {action_id: 2, fighter_id: 1, id: 5},
      {action_id: 8, fighter_id: 1, id: 6},
    ];
    const touchCalls = [];
    const fighterActions = {
      listByFighterID: async () => actions,
      touch: async (id) => touchCalls.push(id),
    };
    const fighters = {update: async () => ({...fighter})};

    await applyTraining({fighterActions, fighters}, fighter);

    assert.deepEqual(touchCalls, [5, 6]);
  });

  it('increases gold for win-type actions', async () => {
    const fighter = {id: 1, gold: '0', stats: BASE_STATS};
    const actions = [{action_id: 1, fighter_id: 1, id: 5}];
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

    assert.equal(updateCalls[0].gold, '1');
  });

  it('returns the updated fighter and actions from the fighters model', async () => {
    const fighter = {id: 1, gold: '0', stats: BASE_STATS};
    const updatedFighter = {id: 1, gold: '0', stats: {...BASE_STATS, stamina: 1}};
    const actions = [{action_id: 2, fighter_id: 1, id: 5}];
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
    const actions = [{action_id: 999, fighter_id: 1, id: 5}];
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

    assert.equal(touchCalls.length, 1);
    assert.equal(updateCalls[0].stats.stamina, 0);
  });
});
