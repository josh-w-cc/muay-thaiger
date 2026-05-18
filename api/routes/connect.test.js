import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';
import websocket from '@fastify/websocket';

import connectRoutes, {onConnect, onMessage} from '../routes/connect.js';
import {mockKnex} from '../data/utils/mock-knex.js';

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
    socket.send(JSON.stringify({token: 'new', type: 'auth'}));
    const message = await readMessage(socket);

    assert.equal(message.type, 'auth');
    assert.equal(message.player_id, 1);
    assert.equal(message.token, 'generated-token');
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

    onConnect(socket, null);
    await waitForImmediate();

    assert.equal(send.calls.length, 0);
  });

  it('ignores invalid JSON auth messages', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage('{', socket, null);

    assert.equal(send.calls.length, 0);
  });

  it('ignores websocket messages that are not valid auth messages', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({type: 'auth'}), socket, null);
    await onMessage(JSON.stringify({token: 123, type: 'auth'}), socket, null);
    await onMessage(JSON.stringify({token: 'new', type: 'noop'}), socket, null);

    assert.equal(send.calls.length, 0);
  });

  it('does not send auth confirmation when websocket is not open', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 0, send};

    await onMessage(JSON.stringify({token: 'new', type: 'auth'}), socket, null);

    assert.equal(send.calls.length, 0);
  });

  it('creates a player and sends the player token on auth new', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const player = {id: 1, token: 'player-uuid-token'};
    const players = {create: async () => player};

    await onMessage(JSON.stringify({token: 'new', type: 'auth'}), socket, players);

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {player_id: 1, token: 'player-uuid-token', type: 'auth'});
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

    await onMessage(JSON.stringify({token: 'known-token', type: 'auth'}), socket, players);

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {player_id: 5, token: 'known-token', type: 'auth'});
  });

  it('responds with token invalid message when auth token does not match a player', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const players = {create: async () => null, findByToken: async () => null};

    await onMessage(JSON.stringify({token: 'unknown-token', type: 'auth'}), socket, players);

    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {type: 'auth-invalid-token'});
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
