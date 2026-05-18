import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';
import websocket from '@fastify/websocket';

import characterActionsRoutes, {onConnect, onMessage} from '../routes/character-actions.js';
import {mockKnexMulti} from '../data/utils/mock-knex.js';


describe('WebSocket /ws/character-actions', () => {
  it('creates a character action for the player current character and sends it back on a valid create message', async () => {
    const created = {id: 1, action_id: 2, character_id: 3, created_at: '2026-01-01T00:00:00.000Z', touched_at: '2026-01-01T00:00:00.000Z'};
    const currentCharacter = {id: 3, player_id: 8, retired: false};
    const {knex} = mockKnexMulti([currentCharacter, [created]]);
    const app = Fastify();
    app.decorate('db', knex);
    await app.register(websocket);
    await app.register(characterActionsRoutes, {prefix: '/ws'});
    await app.ready();

    const socket = await app.injectWS('/ws/character-actions');
    socket.send(JSON.stringify({action_id: 2, cmd: 'create', player_id: 8}));
    const message = await readMessage(socket);

    assert.deepEqual(message, {characterAction: created, type: 'character_action'});
    socket.terminate();
    await app.close();
  });

  it('does not respond to invalid JSON messages', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage('{invalid', socket, {});

    assert.equal(send.calls.length, 0);
  });

  it('does not respond to messages with wrong cmd', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({action_id: 1, cmd: 'noop', player_id: 1}), socket, {});

    assert.equal(send.calls.length, 0);
  });

  it('does not respond when action_id is missing', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({cmd: 'create', player_id: 1}), socket, {});

    assert.equal(send.calls.length, 0);
  });

  it('does not respond when player_id is missing', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};

    await onMessage(JSON.stringify({action_id: 1, cmd: 'create'}), socket, {});

    assert.equal(send.calls.length, 0);
  });

  it('does not respond when websocket is not open', async () => {
    const send = createCallTracker();
    const socket = {OPEN: 1, readyState: 0, send};

    await onMessage(JSON.stringify({action_id: 1, cmd: 'create', player_id: 1}), socket, {});

    assert.equal(send.calls.length, 0);
  });

  it('does not respond when the player has no current character', async () => {
    const send = createCallTracker();
    const create = createCallTracker();
    const socket = {OPEN: 1, readyState: 1, send};
    const characterActions = {create};
    const characters = {findCurrentByPlayerID: async () => null};

    await onMessage(JSON.stringify({action_id: 1, cmd: 'create', player_id: 1}), socket, {characterActions, characters});

    assert.equal(send.calls.length, 0);
    assert.equal(create.calls.length, 0);
  });

  it('registers a message listener on connect', () => {
    const on = createCallTracker();
    const socket = {on};
    const characterActions = {};
    const characters = {};

    onConnect(socket, {characterActions, characters});

    assert.equal(on.calls.length, 1);
    assert.equal(on.calls[0][0], 'message');
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
