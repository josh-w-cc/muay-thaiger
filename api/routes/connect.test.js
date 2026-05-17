import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';
import websocket from '@fastify/websocket';

import connectRoutes from '../routes/connect.js';

describe('WebSocket /connect', () => {
  it('sends an auth request when the websocket connects', async () => {
    const app = Fastify();
    await app.register(websocket);
    await app.register(connectRoutes);
    await app.ready();

    const socket = await app.injectWS('/connect');
    const message = await readMessage(socket);

    assert.deepEqual(message, {type: 'auth'});
    socket.terminate();
    await app.close();
  });
});

async function readMessage(socket) {
  return await new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.once('message', (data) => resolve(JSON.parse(data)));
  });
}
