import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {syncActiveWebhooks} from './sync-player-state.js';

describe('syncActiveWebhooks', () => {
  it('sends each player\'s current character state to active webhook URLs', async () => {
    const characters = {
      findCurrentByPlayerID: async (playerID) => ({display_name: `Char-${playerID}`, id: playerID * 10, player_id: playerID}),
    };
    const webhooks = {
      listActive: async () => [
        {id: 1, player_id: 1, url: 'https://example.com/hook-one'},
        {id: 2, player_id: 2, url: 'https://example.com/hook-two'},
      ],
    };
    const send = createCallTracker(async () => ({}));

    await syncActiveWebhooks({characters, webhooks}, send);

    assert.equal(send.calls.length, 2);
    assert.equal(send.calls[0][0], 'https://example.com/hook-one');
    assert.deepEqual(send.calls[0][1], {
      body: JSON.stringify({
        character: {display_name: 'Char-1', id: 10, player_id: 1},
        player_id: 1,
        type: 'player-state-sync',
      }),
      headers: {'content-type': 'application/json'},
      method: 'POST',
    });
    assert.equal(send.calls[1][0], 'https://example.com/hook-two');
    assert.deepEqual(send.calls[1][1], {
      body: JSON.stringify({
        character: {display_name: 'Char-2', id: 20, player_id: 2},
        player_id: 2,
        type: 'player-state-sync',
      }),
      headers: {'content-type': 'application/json'},
      method: 'POST',
    });
  });

  it('skips webhook delivery when no current character exists', async () => {
    const characters = {findCurrentByPlayerID: async () => null};
    const webhooks = {listActive: async () => [{id: 1, player_id: 3, url: 'https://example.com/hook'}]};
    const send = createCallTracker(async () => ({}));

    await syncActiveWebhooks({characters, webhooks}, send);

    assert.equal(send.calls.length, 0);
  });
});

function createCallTracker(fn) {
  const wrapped = (...args) => {
    wrapped.calls.push(args);
    return fn(...args);
  };
  wrapped.calls = [];
  return wrapped;
}
