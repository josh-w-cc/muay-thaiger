import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';
import websocket from '@fastify/websocket';

import connectRoutes from '../routes/connect.js';

describe('WebSocket /ws/connect', () => {
  it('sends an auth request when the websocket connects', async () => {
    const app = Fastify();
    await app.register(websocket);
    await app.register(connectRoutes, {prefix: '/ws'});
    await app.ready();

    const socket = await app.injectWS('/ws/connect');
    const message = await readMessage(socket);

    assert.deepEqual(message, {type: 'auth'});
    socket.terminate();
    await app.close();
  });

  it('sends a token after receiving a new auth response', async () => {
    const app = Fastify();
    await app.register(websocket);
    await app.register(connectRoutes, {prefix: '/ws'});
    await app.ready();

    const socket = await app.injectWS('/ws/connect');
    await readMessage(socket);
    socket.send(JSON.stringify({type: 'new'}));
    const message = await readMessage(socket);

    assert.equal(message.type, 'token');
    assert.match(message.token, /^[0-9a-f-]{36}$/i);
    socket.terminate();
    await app.close();
  });
});

async function readMessage(socket) {
  return new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.once('message', (data) => resolve(JSON.parse(data)));
  });
}
