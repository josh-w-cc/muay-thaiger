import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {applyOfflineTraining, getPlayerState, sendPlayerState} from './player-state.js';

describe('applyOfflineTraining', () => {
  it('applies training for stale non-retired fighters only once per fighter', async () => {
    const staleRows = [{fighter_id: 1}, {fighter_id: 1}, {fighter_id: 2}, {fighter_id: 3}];
    const touchedPlayerIDs = [];
    const fighterActions = {
      listByFighterID: async () => [{action_id: 1, fighter_id: 1, id: 10, touched_at: new Date().toISOString()}],
      listStaleBefore: async () => staleRows,
      touch: async () => null,
    };
    const fighters = {
      find: async (fighterID) => {
        if(fighterID === 1) {
          return {id: 1, player_id: 11, retired: false, stats: {}};
        }
        if(fighterID === 2) {
          return {id: 2, player_id: 22, retired: true, stats: {}};
        }
        return null;
      },
      findCurrentByPlayerID: async (playerID) => {
        touchedPlayerIDs.push(playerID);
        return {gold: '0', id: 1, player_id: playerID, retired: false, stats: {}};
      },
      update: async (fighterID, data) => ({id: fighterID, player_id: 11, retired: false, ...data}),
    };

    await applyOfflineTraining(null, {fighterActions, fighters});

    assert.deepEqual(touchedPlayerIDs, [11]);
  });
});

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
