import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {createAndSend} from './fighter-actions.js';

describe('createAndSend', () => {
  it('creates a fighter action for the player current fighter and sends it back on a valid message', async () => {
    const created = {id: 1, action_id: 2, character_id: 3, created_at: '2026-01-01T00:00:00.000Z', touched_at: '2026-01-01T00:00:00.000Z'};
    const send = createCallTracker();
    const socket = {OPEN: 1, player: {id: 8}, readyState: 1, send};
    const fighterActions = {create: async () => created};
    const fighters = {findCurrentByPlayerID: async () => ({id: 3, player_id: 8, retired: false})};

    await createAndSend({fighterActions, fighters}, {action_id: 2}, socket);

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {fighterAction: created, type: 'fighter_action'});
  });

  it('does not respond when action_id is missing', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await createAndSend({}, {}, socket);

    assert.equal(send.calls.length, 0);
  });

  it('does not respond when socket has no authenticated player', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await createAndSend({}, {action_id: 1}, socket);

    assert.equal(send.calls.length, 0);
  });

  it('does not respond when websocket is not open', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 0, send};

    await createAndSend({}, {action_id: 1}, socket);

    assert.equal(send.calls.length, 0);
  });

  it('does not respond when the player has no current fighter', async () => {
    const send = createCallTracker();
    const create = createCallTracker();
    const socket = {OPEN: 1, player: {id: 1}, readyState: 1, send};
    const fighterActions = {create};
    const fighters = {findCurrentByPlayerID: async () => null};

    await createAndSend({fighterActions, fighters}, {action_id: 1}, socket);

    assert.equal(send.calls.length, 0);
    assert.equal(create.calls.length, 0);
  });
});

function createCallTracker() {
  const fn = (...args) => {
    fn.calls.push(args);
  };
  fn.calls = [];
  return fn;
}
