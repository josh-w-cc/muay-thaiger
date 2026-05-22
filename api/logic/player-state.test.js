import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {sendPlayerState} from './player-state.js';

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
