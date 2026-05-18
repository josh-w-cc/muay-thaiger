import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import {ToadScheduler} from 'toad-scheduler';

import {syncCharacterState} from '../logic/player-state-sync.js';
import connectRoutes, {onConnect, onMessage} from '../routes/connect.js';
import {mockKnex, mockKnexMulti} from '../data/utils/mock-knex.js';

describe('WebSocket /ws/connect', () => {
  it('sends an auth request when the websocket connects', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(websocket);
    await app.register(connectRoutes, {prefix: '/ws'});
    await app.ready();

    const socket = await app.injectWS('/ws/connect');
    const message = await readMessage(socket);

    assert.deepEqual(message, {type: 'auth'});
    socket.terminate();
    await app.close();
  });

  it('sends auth confirmation with player token after receiving an auth new response', async () => {
    const {knex} = mockKnex([{display_name: 'Player-12345678', id: 1, token: 'generated-token'}]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(websocket);
    await app.register(connectRoutes, {prefix: '/ws'});
    await app.ready();

    const socket = await app.injectWS('/ws/connect');
    await readMessage(socket);
    socket.send(JSON.stringify({cmd: 'auth', race: 2, token: 'new'}));
    const message = await readMessage(socket);

    assert.equal(message.type, 'auth');
    assert.equal(message.player_id, 1);
    assert.equal(message.token, 'generated-token');
    socket.terminate();
    await app.close();
  });

  it('creates a character action and sends it back from /ws/connect on a valid create message', async () => {
    const created = {id: 1, action_id: 2, character_id: 3, created_at: '2026-01-01T00:00:00.000Z', touched_at: '2026-01-01T00:00:00.000Z'};
    const currentCharacter = {id: 3, player_id: 8, retired: false};
    const {knex} = mockKnexMulti([currentCharacter, [created]]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(websocket);
    await app.register(connectRoutes, {prefix: '/ws'});
    await app.ready();

    const socket = await app.injectWS('/ws/connect');
    await readMessage(socket);
    socket.send(JSON.stringify({action_id: 2, cmd: 'create', player_id: 8}));
    const message = await readMessage(socket);

    assert.deepEqual(message, {characterAction: created, type: 'character_action'});
    socket.terminate();
    await app.close();
  });

  it('stops scheduler on app close', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(websocket);
    const originalStop = ToadScheduler.prototype.stop;
    const stop = createCallTracker();
    ToadScheduler.prototype.stop = function (...args) {
      stop(...args);
      return originalStop.apply(this, args);
    };
    await app.register(connectRoutes, {prefix: '/ws'});
    await app.ready();

    try {
      await app.close();
      assert.equal(stop.calls.length, 1);
    }
    finally {
      ToadScheduler.prototype.stop = originalStop;
    }
  });

  it('tracks and removes active sockets during websocket lifecycle', async () => {
    const activeSockets = new Set();
    const eventHandlers = new Map();
    const socket = {
      OPEN: 1,
      on: (eventName, callback) => {
        eventHandlers.set(eventName, callback);
      },
      readyState: 1,
      send: createCallTracker(),
    };

    onConnect(socket, activeSockets, {});

    assert.equal(activeSockets.has(socket), true);
    eventHandlers.get('close')();
    assert.equal(activeSockets.has(socket), false);
    activeSockets.add(socket);
    eventHandlers.get('error')();
    assert.equal(activeSockets.has(socket), false);
  });

  it('does not send auth request on connect when socket is not open', async () => {
    const activeSockets = new Set();
    const send = createCallTracker();
    const socket = {
      OPEN: 1,
      on: createCallTracker(),
      readyState: 0,
      send,
    };

    onConnect(socket, activeSockets, {});
    await waitForImmediate();

    assert.equal(activeSockets.has(socket), false);
    assert.equal(send.calls.length, 0);
  });

  it('ignores invalid JSON auth messages', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage('{', socket, {});

    assert.equal(send.calls.length, 0);
  });

  it('ignores auth commands with missing token', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({cmd: 'auth'}), socket, {});

    assert.equal(send.calls.length, 0);
  });

  it('sends error invalid-cmd for unrecognized commands', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({cmd: 'noop', token: 'new'}), socket, {});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {error: 'invalid-cmd', type: 'error'});
  });

  it('ignores auth messages with non-string token values', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({cmd: 'auth', token: 123}), socket, {});

    assert.equal(send.calls.length, 0);
  });

  it('does not send auth confirmation when websocket is not open', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 0, send};

    await onMessage(JSON.stringify({cmd: 'auth', race: 1, token: 'new'}), socket, {});

    assert.equal(send.calls.length, 0);
  });

  it('creates a player and sends the player token on auth new', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const characters = {create: async () => null};
    const player = {display_name: 'Player-abcdefgh', id: 1, token: 'player-uuid-token'};
    const players = {create: async () => player};

    await onMessage(JSON.stringify({cmd: 'auth', race: 2, token: 'new'}), socket, {characters, players});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {player_id: 1, token: 'player-uuid-token', type: 'auth'});
  });

  it('creates a character with the chosen race when creating a player on auth new', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const characterCreateCalls = [];
    const characters = {
      create: async (input) => {
        characterCreateCalls.push(input);
        return input;
      },
    };
    const player = {display_name: 'Player-abcdefgh', id: 1, token: 'player-uuid-token'};
    const players = {create: async () => player};

    await onMessage(JSON.stringify({cmd: 'auth', race: '2', token: 'new'}), socket, {characters, players});

    assert.equal(characterCreateCalls.length, 1);
    assert.deepEqual(characterCreateCalls[0], {display_name: 'Player-abcdefgh', player_id: 1, race: 2});
  });

  it('does not create a player when auth new race is invalid', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const characters = {create: async () => null};
    const players = {create: async () => ({id: 1, token: 'player-uuid-token'})};

    await onMessage(JSON.stringify({cmd: 'auth', race: 'not-a-race', token: 'new'}), socket, {characters, players});

    assert.equal(send.calls.length, 0);
  });

  it('translates an existing player token to player id on auth', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const players = {
      create: async () => null,
      findByToken: async (token) => {
        if(token !== 'known-token') {
          return null;
        }
        return {id: 5, token};
      },
    };

    await onMessage(JSON.stringify({cmd: 'auth', token: 'known-token'}), socket, {players});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {player_id: 5, token: 'known-token', type: 'auth'});
    assert.equal(socket.playerID, 5);
  });

  it('responds with token invalid message when auth token does not match a player', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const players = {create: async () => null, findByToken: async () => null};

    await onMessage(JSON.stringify({cmd: 'auth', token: 'unknown-token'}), socket, {players});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {type: 'auth-invalid-token'});
    assert.equal(socket.playerID, undefined);
  });

  it('does not respond to create messages when the player has no current character', async () => {
    const send = createCallTracker();
    const create = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const characterActions = {create};
    const characters = {findCurrentByPlayerID: async () => null};

    await onMessage(JSON.stringify({action_id: 1, cmd: 'create', player_id: 1}), socket, {characterActions, characters});

    assert.equal(send.calls.length, 0);
    assert.equal(create.calls.length, 0);
  });

  it('sends character state for each authenticated active websocket', async () => {
    const firstSend = createCallTracker();
    const secondSend = createCallTracker();
    const firstSocket = {OPEN: 1, playerID: 2, readyState: 1, send: firstSend};
    const secondSocket = {OPEN: 1, playerID: 3, readyState: 1, send: secondSend};
    const closedSocket = {OPEN: 1, playerID: 4, readyState: 0, send: createCallTracker()};
    const unauthenticatedSocket = {OPEN: 1, readyState: 1, send: createCallTracker()};
    const activeSockets = new Set([firstSocket, secondSocket, closedSocket, unauthenticatedSocket]);
    const characterStatesByPlayerID = new Map([
      [2, {id: 11, player_id: 2, retired: false}],
      [3, {id: 12, player_id: 3, retired: false}],
    ]);
    const playersLookedUp = [];
    const characters = {
      findCurrentByPlayerID: async (playerID) => {
        playersLookedUp.push(playerID);
        return characterStatesByPlayerID.get(playerID) ?? null;
      },
    };

    await syncCharacterState(activeSockets, {characters});

    assert.deepEqual(playersLookedUp, [2, 3]);
    assert.equal(firstSend.calls.length, 1);
    assert.deepEqual(JSON.parse(firstSend.calls[0][0]), {
      character: {id: 11, player_id: 2, retired: false},
      type: 'character_state',
    });
    assert.equal(secondSend.calls.length, 1);
    assert.deepEqual(JSON.parse(secondSend.calls[0][0]), {
      character: {id: 12, player_id: 3, retired: false},
      type: 'character_state',
    });
  });

  it('does not send character state when no current character exists', async () => {
    const send = createCallTracker();
    const activeSockets = new Set([{OPEN: 1, playerID: 8, readyState: 1, send}]);
    const characters = {findCurrentByPlayerID: async () => null};

    await syncCharacterState(activeSockets, {characters});

    assert.equal(send.calls.length, 0);
  });
});

async function readMessage(socket) {
  return new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.once('message', (data) => resolve(JSON.parse(data)));
  });
}

function createCallTracker() {
  const fn = (...args) => {
    fn.calls.push(args);
  };
  fn.calls = [];
  return fn;
}

async function waitForImmediate() {
  await new Promise((resolve) => setImmediate(resolve));
}
