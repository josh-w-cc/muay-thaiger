import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createMemoryRouter, RouterProvider} from 'react-router';

import {PLAYER_TOKEN_STORAGE_KEY} from './useAuthSocket.js';


const originalWebSocket = globalThis.WebSocket;
const originalLocalStorage = globalThis.localStorage;
const originalWindow = globalThis.window;
let fetchJSONMock;

vi.mock('../../orig/src/menus/CharacterSelect', () => ({
  default: function MockCharacterSelect({onExit}) {
    return <button onClick={() => onExit('1')}>Character Select</button>;
  },
}));

vi.mock('../../orig/src/menus/Fight', () => ({
  default: function MockFight() {
    return <h2>Fight Screen</h2>;
  },
}));

vi.mock('./Hub.js', () => ({
  default: function MockHub({setScreen}) {
    return (
      <>
        <h2>Hub Screen</h2>
        <button onClick={() => setScreen('broken')}>Break Screen</button>
        <button onClick={() => setScreen('character-select')}>Go Character Select</button>
      </>
    );
  },
}));

vi.mock('../../orig/src/menus/Shop', () => ({
  default: function MockShop() {
    return <h2>Shop Screen</h2>;
  },
}));

vi.mock('../../orig/src/menus/Train', () => ({
  default: function MockTrain() {
    return <h2>Train Screen</h2>;
  },
}));

vi.mock('@/utils/fetchAPI.js', () => ({
  fetchJSON: (...args) => fetchJSONMock(...args),
}));

describe('Game', () => {
  beforeEach(() => {
    fetchJSONMock = vi.fn().mockResolvedValue([]);
    globalThis.WebSocket = vi.fn(function () {
      return {close: vi.fn(), readyState: 1, send: vi.fn()};
    });
    globalThis.WebSocket.OPEN = 1;
  });

  afterEach(() => {
    vi.clearAllMocks();
    setLocalStorage(originalLocalStorage);
    globalThis.WebSocket = originalWebSocket;
    globalThis.window = originalWindow;
    if(globalThis.localStorage) {
      localStorage.removeItem(PLAYER_TOKEN_STORAGE_KEY);
    }
  });

  it('loader redirects to hub from index when token exists', async () => {
    const {loader} = await import('./index.js');
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'token-value');

    const response = await loader({params: {}});

    expect(response.headers.get('Location')).toBe('/hub');
    expect(response.status).toBe(302);
  });

  it('loader fetches race statics for character select', async () => {
    const raceStatics = [{id: 1, name: 'Tiger', stats: {}}];
    fetchJSONMock.mockResolvedValue(raceStatics);
    const {loader} = await import('./index.js');

    expect(await loader({params: {}})).toEqual(raceStatics);
    expect(fetchJSONMock).toHaveBeenCalledWith('race');
  });

  it('loader returns null for token-protected screens when token exists', async () => {
    const {loader} = await import('./index.js');
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'token-value');

    expect(await loader({params: {screen: 'hub'}})).toBeNull();
  });

  it('loader redirects to character select for token-protected screens when token is missing', async () => {
    const {loader} = await import('./index.js');

    const response = await loader({params: {screen: 'hub'}});

    expect(response.headers.get('Location')).toBe('/');
    expect(response.status).toBe(302);
  });

  it('loader redirects to character select when localStorage is unavailable', async () => {
    const {loader} = await import('./index.js');
    setLocalStorage(undefined);

    const response = await loader({params: {screen: 'hub'}});

    expect(response.headers.get('Location')).toBe('/');
    expect(response.status).toBe(302);
  });

  it('loader returns an empty list when race statics request fails', async () => {
    const {loader} = await import('./index.js');
    const error = new Error('network failure');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchJSONMock.mockRejectedValue(error);

    expect(await loader({params: {}})).toEqual([]);
    expect(fetchJSONMock).toHaveBeenCalledWith('race');
    expect(consoleError).toHaveBeenCalledWith('Failed to load race statics', error);
    consoleError.mockRestore();
  });

  it('renders the character select screen first', async () => {
    const {default: Game, loader} = await import('./index.js');
    renderGame({Game, loader});
    expect(await screen.findByRole('button', {name: 'Character Select'})).toBeInTheDocument();
  });

  it('connects to the websocket when the game loads', async () => {
    const {default: Game, loader} = await import('./index.js');

    renderGame({Game, loader});
    await screen.findByRole('button', {name: 'Character Select'});

    const socketURL = new URL(globalThis.WebSocket.mock.calls[0][0]);

    expect(socketURL.host).toBe(window.location.host);
    expect(socketURL.pathname).toBe('/ws/connect');
    expect(socketURL.protocol).toBe('ws:');
  });

  it('uses the secure websocket protocol on https pages', async () => {
    const secureWindow = Object.create(window);
    Object.defineProperty(secureWindow, 'location', {
      value: new URL('https://example.test/game'),
    });
    globalThis.window = secureWindow;
    const {default: Game, loader} = await import('./index.js');

    renderGame({Game, loader});
    await screen.findByRole('button', {name: 'Character Select'});

    const socketURL = new URL(globalThis.WebSocket.mock.calls[0][0]);

    expect(socketURL.protocol).toBe('wss:');
  });

  it('renders each game screen from header controls', async () => {
    const user = userEvent.setup();
    const socket = {close: vi.fn(), readyState: 1, send: vi.fn()};
    globalThis.WebSocket = vi.fn(function () {
      return socket;
    });
    globalThis.WebSocket.OPEN = 1;
    const {default: Game, loader} = await import('./index.js');

    renderGame({Game, loader});
    await user.click(await screen.findByRole('button', {name: 'Character Select'}));
    act(() => {
      socket.onmessage({data: JSON.stringify({token: 'new', type: 'auth'})});
    });

    expect(await screen.findByRole('heading', {name: 'Hub Screen'})).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: /fight/i}));
    expect(await screen.findByRole('heading', {name: 'Fight Screen'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: /hub/i}));
    expect(await screen.findByRole('heading', {name: 'Hub Screen'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: /shop/i}));
    expect(await screen.findByRole('heading', {name: 'Shop Screen'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: /train/i}));
    expect(await screen.findByRole('heading', {name: 'Train Screen'})).toBeInTheDocument();
  });

  it('waits for the auth token before routing to hub after fighter select', async () => {
    const user = userEvent.setup();
    const socket = {close: vi.fn(), readyState: 1, send: vi.fn()};
    globalThis.WebSocket = vi.fn(function () {
      return socket;
    });
    globalThis.WebSocket.OPEN = 1;
    const {default: Game, loader} = await import('./index.js');

    renderGame({Game, loader});
    await user.click(await screen.findByRole('button', {name: 'Character Select'}));

    expect(screen.getByRole('button', {name: 'Character Select'})).toBeInTheDocument();
    act(() => {
      socket.onmessage({data: JSON.stringify({token: 'new', type: 'auth'})});
    });
    expect(await screen.findByRole('heading', {name: 'Hub Screen'})).toBeInTheDocument();
  });

  it('responds with auth/new after auth when fighter is selected', async () => {
    const user = userEvent.setup();
    const send = vi.fn();
    const socket = {close: vi.fn(), readyState: 1, send};
    globalThis.WebSocket = vi.fn(function () {
      return socket;
    });
    globalThis.WebSocket.OPEN = 1;
    const {default: Game, loader} = await import('./index.js');

    renderGame({Game, loader});
    await screen.findByRole('button', {name: 'Character Select'});
    socket.onmessage({data: JSON.stringify({type: 'auth'})});
    await user.click(screen.getByRole('button', {name: 'Character Select'}));

    expect(send).toHaveBeenCalledWith(JSON.stringify({race: '1', token: 'new', type: 'auth'}));
  });

  it('responds with auth/local token after auth when fighter is selected', async () => {
    const user = userEvent.setup();
    const send = vi.fn();
    const socket = {close: vi.fn(), readyState: 1, send};
    globalThis.WebSocket = vi.fn(function () {
      return socket;
    });
    globalThis.WebSocket.OPEN = 1;
    const {default: Game, loader} = await import('./index.js');

    renderGame({Game, loader});
    await screen.findByRole('button', {name: 'Character Select'});
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'existing-token');
    socket.onmessage({data: JSON.stringify({type: 'auth'})});
    await user.click(screen.getByRole('button', {name: 'Character Select'}));

    expect(send).toHaveBeenCalledWith(JSON.stringify({token: 'existing-token', type: 'auth'}));
  });

  it('stores the auth token in localStorage when server responds with a token', async () => {
    const socket = {close: vi.fn(), readyState: 1, send: vi.fn()};
    globalThis.WebSocket = vi.fn(function () {
      return socket;
    });
    globalThis.WebSocket.OPEN = 1;
    const {default: Game, loader} = await import('./index.js');

    renderGame({Game, loader});
    await screen.findByRole('button', {name: 'Character Select'});
    socket.onmessage({data: JSON.stringify({token: 'new', type: 'auth'})});

    expect(localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY)).toBe('new');
  });

  it('ignores invalid websocket auth messages', async () => {
    const user = userEvent.setup();
    const send = vi.fn();
    const socket = {close: vi.fn(), readyState: 1, send};
    globalThis.WebSocket = vi.fn(function () {
      return socket;
    });
    globalThis.WebSocket.OPEN = 1;
    const {default: Game, loader} = await import('./index.js');

    renderGame({Game, loader});
    await screen.findByRole('button', {name: 'Character Select'});
    socket.onmessage({data: '{'});
    await user.click(screen.getByRole('button', {name: 'Character Select'}));

    expect(send).not.toHaveBeenCalled();
  });

  it('renders and recovers from the fallback screen', async () => {
    const user = userEvent.setup();
    const socket = {close: vi.fn(), readyState: 1, send: vi.fn()};
    globalThis.WebSocket = vi.fn(function () {
      return socket;
    });
    globalThis.WebSocket.OPEN = 1;
    const {default: Game, loader} = await import('./index.js');

    renderGame({Game, loader});
    await user.click(await screen.findByRole('button', {name: 'Character Select'}));
    act(() => {
      socket.onmessage({data: JSON.stringify({token: 'new', type: 'auth'})});
    });
    await screen.findByRole('heading', {name: 'Hub Screen'});
    await user.click(screen.getByRole('button', {name: 'Break Screen'}));

    expect(screen.getByRole('heading', {name: 'You broke it!?'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'We have to go back'}));
    expect(screen.getByRole('heading', {name: 'Hub Screen'})).toBeInTheDocument();
  });

  it('renders a game screen from the URL', async () => {
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'token-value');
    const {default: Game, loader} = await import('./index.js');
    renderGame({Game, initialPath: '/fight', loader});
    expect(await screen.findByRole('heading', {name: 'Fight Screen'})).toBeInTheDocument();
  });

  it('stays on hub when navigating to character select from a game screen with token', async () => {
    const user = userEvent.setup();
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'token-value');
    const {default: Game, loader} = await import('./index.js');

    renderGame({Game, initialPath: '/hub', loader});
    await user.click(await screen.findByRole('button', {name: 'Go Character Select'}));
    expect(await screen.findByRole('heading', {name: 'Hub Screen'})).toBeInTheDocument();
  });

  it('closes the websocket when the game unmounts', async () => {
    const close = vi.fn();
    globalThis.WebSocket = vi.fn(function () {
      return {close, send: vi.fn()};
    });
    const {default: Game, loader} = await import('./index.js');

    const {unmount} = renderGame({Game, loader});
    await screen.findByRole('button', {name: 'Character Select'});
    unmount();

    expect(close).toHaveBeenCalledTimes(1);
  });
});

function renderGame({Game, initialPath = '/', loader}) {
  const router = createMemoryRouter(
    [{element: <Game />, loader, path: '/:screen?'}],
    {initialEntries: [initialPath]},
  );

  return render(
    <RouterProvider fallbackElement={<div>Loading...</div>} router={router} />,
  );
}

function setLocalStorage(value) {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value,
  });
}
