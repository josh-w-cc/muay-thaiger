import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {getPlayerState, sendPlayerState} from './player-state.js';

describe('getPlayerState', () => {
  it('returns actions and updated fighter after applying training', async () => {
    const fighter = {gold: '0', id: 9, player_id: 5, retired: false, stats: {}};
    const updatedFighter = {...fighter, gold: '1'};
    const actions = [{action_id: 1, fighter_id: 9, id: 7, touched_at: new Date().toISOString()}];
    const fighterActions = {
      listByFighterID: async () => actions,
      touch: async () => null,
    };
    const fighters = {
      findCurrentByPlayerID: async () => fighter,
      update: async () => updatedFighter,
    };

    const result = await getPlayerState({fighterActions, fighters}, 5);

    assert.equal(result.fighter, updatedFighter);
    assert.deepEqual(result.actions, actions);
  });

  it('returns actions and original fighter when no actions are present', async () => {
    const fighter = {id: 9, player_id: 5, retired: false, stats: {}};
    const fighterActions = {listByFighterID: async () => []};
    const fighters = {findCurrentByPlayerID: async () => fighter};

    const result = await getPlayerState({fighterActions, fighters}, 5);

    assert.deepEqual(result, {actions: [], fighter});
  });

  it('returns null when the player has no current fighter', async () => {
    const fighters = {findCurrentByPlayerID: async () => null};

    const result = await getPlayerState({fighters}, 5);

    assert.equal(result, null);
  });
});

describe('sendPlayerState', () => {
  it('sends a player_state message with the given actions and fighter', () => {
    const send = createCallTracker();
    const socket = {send};
    const fighter = {gold: '0', id: 9, player_id: 5, retired: false, stats: {}};
    const actions = [{action_id: 1, fighter_id: 9, id: 7}];

    sendPlayerState(actions, fighter, socket);

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {actions, cmd: 'player_state', fighter});
  });

  it('sends player_state with an empty actions array', () => {
    const send = createCallTracker();
    const socket = {send};
    const fighter = {id: 3, player_id: 2, retired: false, stats: {}};

    sendPlayerState([], fighter, socket);

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {actions: [], cmd: 'player_state', fighter});
  });
});

function createCallTracker() {
  const fn = (...args) => {
    fn.calls.push(args);
  };
  fn.calls = [];
  return fn;
}
