import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';
import websocket from '@fastify/websocket';

import websocketRoutes, {onConnect, onMessage, syncPlayerState} from '../routes/websocket.js';
import {mockKnex, mockKnexMulti} from '../data/utils/mock-knex.js';

describe('WebSocket /ws/connect', () => {
  it('sends an auth request when the websocket connects', async () => {
    const {knex} = mockKnex(undefined);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(websocket);
    await app.register(websocketRoutes, {prefix: '/ws'});
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
    await app.register(websocketRoutes, {prefix: '/ws'});
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

  it('creates a fighter action and sends it back from /ws/connect on a valid idle message', async () => {
    const created = {id: 1, action_id: 2, fighter_id: 3, created_at: '2026-01-01T00:00:00.000Z', touched_at: '2026-01-01T00:00:00.000Z'};
    const currentFighter = {id: 3, player_id: 8, retired: false};
    const player = {id: 8, token: 'player-token'};
    const {knex} = mockKnexMulti([player, currentFighter, [created]]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(websocket);
    await app.register(websocketRoutes, {prefix: '/ws'});
    await app.ready();

    const socket = await app.injectWS('/ws/connect');
    await readMessage(socket);
    socket.send(JSON.stringify({cmd: 'auth', token: 'player-token'}));
    await readMessage(socket);
    socket.send(JSON.stringify({action_id: 2, cmd: 'idle'}));
    const message = await readMessage(socket);

    assert.deepEqual(message, {fighterAction: created, type: 'fighter_action'});
    socket.terminate();
    await app.close();
  });

  it('does not send auth request on connect when socket is not open', async () => {
    const send = createCallTracker();
    const socket = {
      OPEN: 1,
      on: createCallTracker(),
      readyState: 0,
      send,
    };

    onConnect(socket, {});
    await waitForImmediate();

    assert.equal(send.calls.length, 0);
  });

  it('removes websocket from active connections when it closes', async () => {
    const socketOn = createCallTracker();
    const socket = {OPEN: 1, on: socketOn, readyState: 1, send: createCallTracker()};
    const connections = new Set();

    onConnect(socket, {}, connections);
    assert.equal(connections.has(socket), true);

    const closeHandler = socketOn.calls.find(([eventName]) => eventName === 'close')[1];
    closeHandler();
    assert.equal(connections.has(socket), false);
  });

  it('ignores invalid JSON auth messages', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage('{', socket, {});

    assert.equal(send.calls.length, 0);
  });

  it('responds with token invalid message for auth commands with missing token', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({cmd: 'auth'}), socket, {});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {type: 'auth-invalid-token'});
  });

  it('sends error invalid-cmd for unrecognized commands', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({cmd: 'noop', token: 'new'}), socket, {});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {error: 'invalid-cmd', type: 'error'});
  });

  it('responds with token invalid message for auth messages with non-string token values', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({cmd: 'auth', token: 123}), socket, {});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {type: 'auth-invalid-token'});
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
    const fighters = {create: async () => null};
    const player = {display_name: 'Player-abcdefgh', id: 1, token: 'player-uuid-token'};
    const players = {create: async () => player};

    await onMessage(JSON.stringify({cmd: 'auth', race: 2, token: 'new'}), socket, {fighters, players});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {player_id: 1, token: 'player-uuid-token', type: 'auth'});
  });

  it('creates a fighter with the chosen race when creating a player on auth new', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const fighterCreateCalls = [];
    const fighters = {
      create: async (input) => {
        fighterCreateCalls.push(input);
        return input;
      },
    };
    const player = {display_name: 'Player-abcdefgh', id: 1, token: 'player-uuid-token'};
    const players = {create: async () => player};

    await onMessage(JSON.stringify({cmd: 'auth', race: '2', token: 'new'}), socket, {fighters, players});

    assert.equal(fighterCreateCalls.length, 1);
    assert.deepEqual(fighterCreateCalls[0], {display_name: 'Player-abcdefgh', player_id: 1, race: 2});
  });

  it('does not create a player when auth new race is invalid', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const fighters = {create: async () => null};
    const players = {create: async () => ({id: 1, token: 'player-uuid-token'})};

    await onMessage(JSON.stringify({cmd: 'auth', race: 'not-a-race', token: 'new'}), socket, {fighters, players});

    assert.equal(send.calls.length, 0);
  });

  it('translates an existing player token to player id on auth', async () => {
    const send = createCallTracker();
    const player = {id: 5, token: 'known-token'};
    const socket = {OPEN: 1, readyState: 1, send};
    const players = {
      create: async () => null,
      findByToken: async (token) => {
        if(token !== 'known-token') {
          return null;
        }
        return player;
      },
    };

    await onMessage(JSON.stringify({cmd: 'auth', token: 'known-token'}), socket, {players});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {player_id: 5, token: 'known-token', type: 'auth'});
  });

  it('attaches player to socket after successful authentication', async () => {
    const send = createCallTracker();
    const player = {id: 5, token: 'known-token'};
    const socket = {OPEN: 1, readyState: 1, send};
    const players = {
      create: async () => null,
      findByToken: async (token) => (token === 'known-token' ? player : null),
    };

    await onMessage(JSON.stringify({cmd: 'auth', token: 'known-token'}), socket, {players});

    assert.equal(socket.player, player);
  });

  it('responds with token invalid message when auth token does not match a player', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const players = {create: async () => null, findByToken: async () => null};

    await onMessage(JSON.stringify({cmd: 'auth', token: 'unknown-token'}), socket, {players});

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {type: 'auth-invalid-token'});
  });

  it('does not respond to idle messages when the player has no current fighter', async () => {
    const send = createCallTracker();
    const create = createCallTracker();
    const socket = {OPEN: 1, player: {id: 1}, readyState: 1, send};
    const fighterActions = {create};
    const fighters = {findCurrentByPlayerID: async () => null};

    await onMessage(JSON.stringify({action_id: 1, cmd: 'idle'}), socket, {fighterActions, fighters});

    assert.equal(send.calls.length, 0);
    assert.equal(create.calls.length, 0);
  });

  it('syncs each authenticated player current fighter state', async () => {
    const sendOpen = createCallTracker();
    const sendNoFighter = createCallTracker();
    const fighters = {
      findCurrentByPlayerID: async (id) => {
        if(id === 1) {
          return {id: 9, player_id: 1, retired: false};
        }
        return null;
      },
    };
    const sockets = new Set([
      {OPEN: 1, player: {id: 1}, readyState: 1, send: sendOpen},
      {OPEN: 1, player: {id: 2}, readyState: 1, send: sendNoFighter},
      {OPEN: 1, readyState: 1, send: createCallTracker()},
      {OPEN: 1, player: {id: 3}, readyState: 0, send: createCallTracker()},
    ]);

    await syncPlayerState({fighters}, sockets);

    assert.equal(sendOpen.calls.length, 1);
    assert.deepEqual(JSON.parse(sendOpen.calls[0][0]), {
      fighter: {id: 9, player_id: 1, retired: false},
      type: 'player_state',
    });
    assert.equal(sendNoFighter.calls.length, 0);
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
