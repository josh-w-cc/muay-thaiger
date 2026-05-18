import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';
import websocket from '@fastify/websocket';

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
    const {calls, knex} = mockKnexMulti(
      [
        [{display_name: 'Player-12345678', id: 1, token: 'generated-token'}],
        [{display_name: 'Player-12345678 Jr', id: 1, player_id: 1, race: 2}],
      ],
    );
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(websocket);
    await app.register(connectRoutes, {prefix: '/ws'});
    await app.ready();

    const socket = await app.injectWS('/ws/connect');
    await readMessage(socket);
    socket.send(JSON.stringify({race: '2', token: 'new', type: 'auth'}));
    const message = await readMessage(socket);

    assert.equal(message.type, 'auth');
    assert.equal(message.token, 'generated-token');
    assert.ok(calls.some((call) => call[0] === 'table' && call[1] === 'characters'));
    assert.deepEqual(
      calls.find((call) => call[0] === 'insert' && call[1].display_name === 'Player-12345678 Jr')?.[1],
      {display_name: 'Player-12345678 Jr', player_id: 1, race: 2},
    );
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

    onConnect(socket, null, null);
    await waitForImmediate();

    assert.equal(send.calls.length, 0);
  });

  it('ignores invalid JSON auth messages', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage('{', socket, null, null);

    assert.equal(send.calls.length, 0);
  });

  it('ignores websocket messages that are not auth/new', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({type: 'auth'}), socket, null, null);
    await onMessage(JSON.stringify({token: 'new', type: 'noop'}), socket, null, null);

    assert.equal(send.calls.length, 0);
  });

  it('does not send auth confirmation when websocket is not open', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 0, send};

    await onMessage(JSON.stringify({token: 'new', type: 'auth'}), socket, null, null);

    assert.equal(send.calls.length, 0);
  });

  it('creates a player and character, then sends the player token on auth new', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const createCharacter = createCallTracker();
    const createPlayer = createCallTracker();
    const player = {display_name: 'Player-12345678', id: 1, token: 'player-uuid-token'};
    const characters = {create: async (...args) => {
      createCharacter(...args);
      return {id: 1};
    }};
    const players = {create: async (...args) => {
      createPlayer(...args);
      return player;
    }};

    await onMessage(JSON.stringify({race: '2', token: 'new', type: 'auth'}), socket, characters, players);

    assert.equal(createPlayer.calls.length, 1);
    assert.equal(createCharacter.calls.length, 1);
    assert.deepEqual(createCharacter.calls[0][0], {display_name: 'Player-12345678 Jr', player_id: 1, race: 2});
    assert.equal(send.calls.length, 1);
    assert.deepEqual(JSON.parse(send.calls[0][0]), {token: 'player-uuid-token', type: 'auth'});
  });

  it('rejects auth/new without a race', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const createCharacter = createCallTracker();
    const createPlayer = createCallTracker();
    const player = {display_name: 'Player-12345678', id: 1, token: 'player-uuid-token'};
    const characters = {create: async (...args) => {
      createCharacter(...args);
      return {id: 1};
    }};
    const players = {create: async (...args) => {
      createPlayer(...args);
      return player;
    }};

    await onMessage(JSON.stringify({token: 'new', type: 'auth'}), socket, characters, players);

    assert.equal(createPlayer.calls.length, 0);
    assert.equal(createCharacter.calls.length, 0);
    assert.equal(send.calls.length, 0);
  });

  it('rejects auth/new with an invalid race value', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const createCharacter = createCallTracker();
    const createPlayer = createCallTracker();
    const player = {display_name: 'Player-12345678', id: 1, token: 'player-uuid-token'};
    const characters = {create: async (...args) => {
      createCharacter(...args);
      return {id: 1};
    }};
    const players = {create: async (...args) => {
      createPlayer(...args);
      return player;
    }};

    await onMessage(JSON.stringify({race: 'invalid', token: 'new', type: 'auth'}), socket, characters, players);

    assert.equal(createPlayer.calls.length, 0);
    assert.equal(createCharacter.calls.length, 0);
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
