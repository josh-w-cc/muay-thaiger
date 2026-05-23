import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {getPlayerState, sendPlayerState} from './player-state.js';

describe('getPlayerState', () => {
  it('returns actions and fighter for a player with a current fighter', async () => {
    const fighter = {id: 9, player_id: 5, retired: false, stats: {}};
    const actions = [{action_id: 1, fighter_id: 9, id: 7}];
    const fighterActions = {listByFighterID: async () => actions};
    const fighters = {findCurrentByPlayerID: async () => fighter};

    const result = await getPlayerState({fighterActions, fighters}, 5);

    assert.deepEqual(result, {actions, fighter});
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
