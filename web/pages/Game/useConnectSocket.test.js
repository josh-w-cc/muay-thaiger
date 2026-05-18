import {render, waitFor} from '@testing-library/react';

import useConnectSocket from './useConnectSocket.js';


const originalWebSocket = globalThis.WebSocket;
const originalLocation = globalThis.window.location;

describe('useConnectSocket', () => {
  beforeEach(() => {
    globalThis.WebSocket = vi.fn(function () {
      return {close: vi.fn(), readyState: 1, send: vi.fn()};
    });
    globalThis.WebSocket.OPEN = 1;
  });

  afterEach(() => {
    vi.clearAllMocks();
    globalThis.WebSocket = originalWebSocket;
    Object.defineProperty(globalThis.window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('connects to /ws/connect using the current host', async () => {
    render(<TestHarness onMessage={vi.fn()} />);

    await waitFor(() => {
      expect(globalThis.WebSocket).toHaveBeenCalled();
    });
    const socketURL = new URL(globalThis.WebSocket.mock.calls[0][0]);

    expect(socketURL.host).toBe(window.location.host);
    expect(socketURL.pathname).toBe('/ws/connect');
    expect(socketURL.protocol).toBe('ws:');
  });

  it('uses the secure websocket protocol on https pages', async () => {
    Object.defineProperty(globalThis.window, 'location', {
      configurable: true,
      enumerable: true,
      value: new URL('https://example.test/game'),
      writable: true,
    });
    render(<TestHarness onMessage={vi.fn()} />);

    await waitFor(() => {
      expect(globalThis.WebSocket).toHaveBeenCalled();
    });
    const socketURL = new URL(globalThis.WebSocket.mock.calls[0][0]);

    expect(socketURL.protocol).toBe('wss:');
  });

  it('forwards valid messages and ignores invalid JSON', async () => {
    const onMessage = vi.fn();
    const socket = {close: vi.fn(), readyState: 1, send: vi.fn()};
    globalThis.WebSocket = vi.fn(function () {
      return socket;
    });
    globalThis.WebSocket.OPEN = 1;
    render(<TestHarness onMessage={onMessage} />);

    await waitFor(() => {
      expect(socket.onmessage).toEqual(expect.any(Function));
    });
    socket.onmessage({data: JSON.stringify({type: 'auth'})});
    socket.onmessage({data: '{'});

    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledWith({message: {type: 'auth'}, socket});
  });

  it('closes the websocket when unmounted', async () => {
    const close = vi.fn();
    globalThis.WebSocket = vi.fn(function () {
      return {close, readyState: 1, send: vi.fn()};
    });
    globalThis.WebSocket.OPEN = 1;
    const {unmount} = render(<TestHarness onMessage={vi.fn()} />);

    await waitFor(() => {
      expect(globalThis.WebSocket).toHaveBeenCalled();
    });
    unmount();

    expect(close).toHaveBeenCalledTimes(1);
  });
});

function TestHarness({onMessage}) {
  useConnectSocket(onMessage);

  return <div>socket</div>;
}
