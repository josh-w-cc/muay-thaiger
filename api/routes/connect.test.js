import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import Fastify from 'fastify';
import websocket from '@fastify/websocket';

import connectRoutes, {onConnect, onMessage} from '../routes/connect.js';

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

  it('sends auth confirmation after receiving an auth new response', async () => {
    const app = Fastify();
    await app.register(websocket);
    await app.register(connectRoutes, {prefix: '/ws'});
    await app.ready();

    const socket = await app.injectWS('/ws/connect');
    await readMessage(socket);
    socket.send(JSON.stringify({token: 'new', type: 'auth'}));
    const message = await readMessage(socket);

    assert.deepEqual(message, {token: 'new', type: 'auth'});
    socket.terminate();
    await app.close();
  });

  it('does not send auth request on connect when socket is not open', async () => {
    const send = generateFn();
    const socket = {
      on: generateFn(),
      OPEN: 1,
      readyState: 0,
      send,
    };

    onConnect(socket);
    await waitForImmediate();

    assert.equal(send.calls.length, 0);
  });

  it('ignores invalid JSON auth messages', () => {
    const send = generateFn();
    const socket = {OPEN: 1, readyState: 1, send};

    onMessage('{', socket);

    assert.equal(send.calls.length, 0);
  });

  it('ignores websocket messages that are not auth/new', () => {
    const send = generateFn();
    const socket = {OPEN: 1, readyState: 1, send};

    onMessage(JSON.stringify({type: 'auth'}), socket);
    onMessage(JSON.stringify({token: 'new', type: 'noop'}), socket);

    assert.equal(send.calls.length, 0);
  });

  it('does not send auth confirmation when websocket is not open', () => {
    const send = generateFn();
    const socket = {OPEN: 1, readyState: 0, send};

    onMessage(JSON.stringify({token: 'new', type: 'auth'}), socket);

    assert.equal(send.calls.length, 0);
  });
});

async function readMessage(socket) {
  return new Promise((resolve, reject) => {
    socket.once('error', reject);
    socket.once('message', (data) => resolve(JSON.parse(data)));
  });
}

function generateFn() {
  const fn = (...args) => {
    fn.calls.push(args);
  };
  fn.calls = [];
  return fn;
}

async function waitForImmediate() {
  await new Promise((resolve) => setImmediate(resolve));
}
