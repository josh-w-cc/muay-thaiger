import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createMemoryRouter, RouterProvider, useNavigate} from 'react-router-dom';

import selectFighter from '@/actions/selectFighter.js';
import {connectSocketOnAppLoad, resetSocketState} from '@/actions/websockets/index.js';
import {PLAYER_TOKEN_STORAGE_KEY, setPlayerToken} from '@/actions/websockets/state/token.js';
import {resetPlayerStore} from '@/data/player.js';
import useMovesStore, {resetMovesStore} from '@/data/moves.js';
import useRacesStore, {resetRacesStore} from '@/data/races.js';
import Fight from '../GameLayout/Fight';
import Hub from '../GameLayout/Hub';
import Shop from '../GameLayout/Shop';
import Train from '../GameLayout/Train';
import EditUser, {loader as editUserLoader} from '../EditUser';
import Fallback from '../GameLayout/Fallback.js';
import {GameLayout, loader as gameScreenLoader} from '../GameLayout/index.js';


const originalWebSocket = globalThis.WebSocket;
const originalLocalStorage = globalThis.localStorage;
const originalLocation = globalThis.window.location;
const originalWindow = globalThis.window;
let fetchJSONMock;
const {routerNavigate} = vi.hoisted(() => ({
  routerNavigate: vi.fn(),
}));

vi.mock('../FighterSelect', () => ({
  default: function MockFighterSelect() {
    return (
      <button
        onClick={() => selectFighter('1')}
      >
        Fighter Select
      </button>
    );
  },
}));

vi.mock('../GameLayout/Fight', () => ({
  default: function MockFight() {
    return <h2>Fight Screen</h2>;
  },
}));

vi.mock('../GameLayout/Hub', () => ({
  default: function MockHub() {
    const navigate = useNavigate();

    return (
      <>
        <h2>Hub Screen</h2>
        <button onClick={() => navigate('/broken')}>Break Screen</button>
        <button onClick={() => navigate('/')}>Go Fighter Select</button>
      </>
    );
  },
}));

vi.mock('../GameLayout/Shop', () => ({
  default: function MockShop() {
    return <h2>Shop Screen</h2>;
  },
}));

vi.mock('../EditUser', () => ({
  default: function MockEditUser() {
    const navigate = useNavigate();

    return (
      <>
        <h2>Edit User Screen</h2>
        <button onClick={() => navigate('/hub')}>Return to Hub</button>
      </>
    );
  },
  loader: vi.fn(),
}));

vi.mock('../GameLayout/Train', () => ({
  default: function MockTrain() {
    return <h2>Train Screen</h2>;
  },
}));

vi.mock('@/utils/fetchAPI.js', () => ({
  fetchJSON: (...args) => fetchJSONMock(...args),
}));
vi.mock('@/router.js', () => ({
  default: {navigate: (...args) => routerNavigate(...args)},
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
    if(globalThis.localStorage) {
      localStorage.removeItem(PLAYER_TOKEN_STORAGE_KEY);
    }
    resetSocketState();
    resetPlayerStore();
    resetMovesStore();
    resetRacesStore();
    setLocalStorage(originalLocalStorage);
    globalThis.WebSocket = originalWebSocket;
    try {
      Object.defineProperty(globalThis.window, 'location', {
        configurable: true,
        value: originalLocation,
      });
    }
    catch {
      // window.location was not mocked in this test; nothing to restore
    }
    globalThis.window = originalWindow;
  });

  it('loader redirects to hub from index when token exists', async () => {
    const {fighterSelectLoader} = await import('./index.js');
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'token-value');

    const response = await fighterSelectLoader();

    expect(response.headers.get('Location')).toBe('/hub');
    expect(response.status).toBe(302);
    expect(fetchJSONMock).not.toHaveBeenCalled();
  });

  it('loader fetches races for fighter select', async () => {
    const moves = [{id: 1, name: 'Wild Punch'}];
    const races = [{id: 1, name: 'Tiger', stats: {speed: '4'}}];
    fetchJSONMock.mockImplementation((path) => {
      if(path === 'moves') {
        return Promise.resolve(moves);
      }
      if(path === 'race') {
        return Promise.resolve(races);
      }
      return Promise.resolve([]);
    });
    const {fighterSelectLoader} = await import('./index.js');

    expect(await fighterSelectLoader()).toEqual(races);
    expect(fetchJSONMock).toHaveBeenNthCalledWith(1, 'moves');
    expect(fetchJSONMock).toHaveBeenNthCalledWith(2, 'race');
    expect(useMovesStore.getState().moves).toEqual(moves);
    expect(useRacesStore.getState().races).toEqual([
      {id: 1, name: 'Tiger', stats: {speed: 4n}},
    ]);
  });

  it('loader redirects to fighter select for token-protected screens when token is missing', async () => {
    const response = await gameScreenLoader();

    expect(response.headers.get('Location')).toBe('/');
    expect(response.status).toBe(302);
  });

  it('loader redirects to fighter select when localStorage is unavailable', async () => {
    setLocalStorage(undefined);

    const response = await gameScreenLoader();

    expect(response.headers.get('Location')).toBe('/');
    expect(response.status).toBe(302);
  });

  it('loader returns an empty list when races request fails', async () => {
    const moves = [{id: 1, name: 'Wild Punch'}];
    useRacesStore.getState().setRaces([{id: 99, name: 'Old', stats: {speed: 4}}]);
    useMovesStore.getState().setMoves([{id: 77, name: 'Old Move'}]);
    const {fighterSelectLoader} = await import('./index.js');
    const error = new Error('network failure');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchJSONMock.mockImplementation((path) => {
      if(path === 'moves') {
        return Promise.resolve(moves);
      }
      if(path === 'race') {
        return Promise.reject(error);
      }
      return Promise.resolve([]);
    });

    expect(await fighterSelectLoader()).toEqual([]);
    expect(fetchJSONMock).toHaveBeenNthCalledWith(1, 'moves');
    expect(fetchJSONMock).toHaveBeenNthCalledWith(2, 'race');
    expect(useMovesStore.getState().moves).toEqual(moves);
    expect(consoleError).toHaveBeenCalledWith('Failed to load races', error);
    expect(useRacesStore.getState().races).toEqual([]);
    consoleError.mockRestore();
  });

  it('loader clears moves when moves request fails', async () => {
    const {fighterSelectLoader} = await import('./index.js');
    const movesError = new Error('moves failure');
    const races = [{id: 1, name: 'Tiger', stats: {speed: '4'}}];
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    useMovesStore.getState().setMoves([{id: 77, name: 'Old Move'}]);
    fetchJSONMock.mockImplementation((path) => {
      if(path === 'moves') {
        return Promise.reject(movesError);
      }
      if(path === 'race') {
        return Promise.resolve(races);
      }
      return Promise.resolve([]);
    });

    expect(await fighterSelectLoader()).toEqual(races);
    expect(fetchJSONMock).toHaveBeenNthCalledWith(1, 'moves');
    expect(fetchJSONMock).toHaveBeenNthCalledWith(2, 'race');
    expect(consoleError).toHaveBeenCalledWith('Failed to load moves', movesError);
    expect(useMovesStore.getState().moves).toEqual([]);
    consoleError.mockRestore();
  });

  it('renders the fighter select screen first', async () => {
    const gameModule = await import('./index.js');
    renderGame({gameModule});
    expect(await screen.findByRole('button', {name: 'Fighter Select'})).toBeInTheDocument();
  });

  it('connects to the websocket when the game loads', async () => {
    const gameModule = await import('./index.js');

    renderGame({gameModule});
    await screen.findByRole('button', {name: 'Fighter Select'});

    await waitFor(() => {
      expect(globalThis.WebSocket).toHaveBeenCalled();
    });
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
    const gameModule = await import('./index.js');

    renderGame({gameModule});
    await screen.findByRole('button', {name: 'Fighter Select'});

    await waitFor(() => {
      expect(globalThis.WebSocket).toHaveBeenCalled();
    });
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
    const gameModule = await import('./index.js');

    renderGame({gameModule});
    await user.click(await screen.findByRole('button', {name: 'Fighter Select'}));
    act(() => {
      socket.onmessage({data: JSON.stringify({cmd: 'auth', token: 'new'})});
    });

    expect(await screen.findByRole('heading', {name: 'Hub Screen'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Edit Profile'})).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Edit Profile'}));
    expect(await screen.findByRole('heading', {name: 'Edit User Screen'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: /^fight$/i})).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Edit Profile'})).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Return to Hub'}));
    expect(await screen.findByRole('heading', {name: 'Hub Screen'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: /^fight$/i}));
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
    const gameModule = await import('./index.js');

    renderGame({gameModule});
    await user.click(await screen.findByRole('button', {name: 'Fighter Select'}));

    expect(screen.getByRole('button', {name: 'Fighter Select'})).toBeInTheDocument();
    act(() => {
      socket.onmessage({data: JSON.stringify({cmd: 'auth', token: 'new'})});
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
    const gameModule = await import('./index.js');

    renderGame({gameModule});
    await screen.findByRole('button', {name: 'Fighter Select'});
    socket.onmessage({data: JSON.stringify({cmd: 'auth'})});
    await user.click(screen.getByRole('button', {name: 'Fighter Select'}));

    expect(send).toHaveBeenCalledWith(JSON.stringify({cmd: 'auth', race: '1', token: 'new'}));
  });

  it('responds with auth/local token after auth when fighter is selected', async () => {
    const user = userEvent.setup();
    const send = vi.fn();
    const socket = {close: vi.fn(), readyState: 1, send};
    globalThis.WebSocket = vi.fn(function () {
      return socket;
    });
    globalThis.WebSocket.OPEN = 1;
    const gameModule = await import('./index.js');

    renderGame({gameModule});
    await screen.findByRole('button', {name: 'Fighter Select'});
    setPlayerToken('existing-token');
    socket.onmessage({data: JSON.stringify({cmd: 'auth'})});
    await user.click(screen.getByRole('button', {name: 'Fighter Select'}));

    expect(send).toHaveBeenCalledWith(JSON.stringify({cmd: 'auth', token: 'existing-token'}));
  });

  it('stores the auth token in localStorage when server responds with a token', async () => {
    const socket = {close: vi.fn(), readyState: 1, send: vi.fn()};
    globalThis.WebSocket = vi.fn(function () {
      return socket;
    });
    globalThis.WebSocket.OPEN = 1;
    const gameModule = await import('./index.js');

    renderGame({gameModule});
    await screen.findByRole('button', {name: 'Fighter Select'});
    socket.onmessage({data: JSON.stringify({cmd: 'auth', token: 'new'})});

    await waitFor(() => {
      expect(localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY)).toBe('new');
    });
  });

  it('clears invalid auth token and redirects to /', async () => {
    Object.defineProperty(globalThis.window, 'location', {
      configurable: true,
      value: {href: 'http://localhost/'},
      writable: true,
    });
    const send = vi.fn();
    const socket = {close: vi.fn(), readyState: 1, send};
    globalThis.WebSocket = vi.fn(function () {
      return socket;
    });
    globalThis.WebSocket.OPEN = 1;
    const gameModule = await import('./index.js');

    renderGame({gameModule});
    await screen.findByRole('button', {name: 'Fighter Select'});
    setPlayerToken('existing-token');
    socket.onmessage({data: JSON.stringify({cmd: 'auth'})});
    socket.onmessage({data: JSON.stringify({cmd: 'auth-invalid-token'})});

    expect(localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY)).toBeNull();
    expect(globalThis.window.location.href).toBe('/');
  });

  it('redirects to / on invalid token even when localStorage is unavailable', async () => {
    Object.defineProperty(globalThis.window, 'location', {
      configurable: true,
      value: {href: 'http://localhost/'},
      writable: true,
    });
    const send = vi.fn();
    const socket = {close: vi.fn(), readyState: 1, send};
    globalThis.WebSocket = vi.fn(function () {
      return socket;
    });
    globalThis.WebSocket.OPEN = 1;
    const gameModule = await import('./index.js');

    setLocalStorage(undefined);
    renderGame({gameModule});
    await screen.findByRole('button', {name: 'Fighter Select'});
    socket.onmessage({data: JSON.stringify({cmd: 'auth'})});
    socket.onmessage({data: JSON.stringify({cmd: 'auth-invalid-token'})});

    expect(globalThis.window.location.href).toBe('/');
  });

  it('ignores invalid websocket auth messages', async () => {
    const user = userEvent.setup();
    const send = vi.fn();
    const socket = {close: vi.fn(), readyState: 1, send};
    globalThis.WebSocket = vi.fn(function () {
      return socket;
    });
    globalThis.WebSocket.OPEN = 1;
    const gameModule = await import('./index.js');

    renderGame({gameModule});
    await screen.findByRole('button', {name: 'Fighter Select'});
    socket.onmessage({data: '{'});
    await user.click(screen.getByRole('button', {name: 'Fighter Select'}));

    expect(send).not.toHaveBeenCalled();
  });

  it('ignores websocket messages that are not auth messages', async () => {
    const user = userEvent.setup();
    const send = vi.fn();
    const socket = {close: vi.fn(), readyState: 1, send};
    globalThis.WebSocket = vi.fn(function () {
      return socket;
    });
    globalThis.WebSocket.OPEN = 1;
    const gameModule = await import('./index.js');

    renderGame({gameModule});
    await screen.findByRole('button', {name: 'Fighter Select'});
    socket.onmessage({data: JSON.stringify({cmd: 'noop'})});
    await user.click(screen.getByRole('button', {name: 'Fighter Select'}));

    expect(send).not.toHaveBeenCalled();
  });

  it('renders and recovers from the fallback screen', async () => {
    const user = userEvent.setup();
    const socket = {close: vi.fn(), readyState: 1, send: vi.fn()};
    globalThis.WebSocket = vi.fn(function () {
      return socket;
    });
    globalThis.WebSocket.OPEN = 1;
    const gameModule = await import('./index.js');

    renderGame({gameModule});
    await user.click(await screen.findByRole('button', {name: 'Fighter Select'}));
    act(() => {
      socket.onmessage({data: JSON.stringify({cmd: 'auth', token: 'new'})});
    });
    await screen.findByRole('heading', {name: 'Hub Screen'});
    await user.click(screen.getByRole('button', {name: 'Break Screen'}));

    expect(screen.getByRole('heading', {name: 'You broke it!?'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'We have to go back'}));
    expect(screen.getByRole('heading', {name: 'Hub Screen'})).toBeInTheDocument();
  });

  it('renders a game screen from the URL', async () => {
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'token-value');
    const gameModule = await import('./index.js');
    renderGame({gameModule, initialPath: '/fight'});
    expect(await screen.findByRole('heading', {name: 'Fight Screen'})).toBeInTheDocument();
  });

  it('renders the edit user screen from the URL without the game header', async () => {
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'token-value');
    const gameModule = await import('./index.js');

    renderGame({gameModule, initialPath: '/edit-user'});

    expect(await screen.findByRole('heading', {name: 'Edit User Screen'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: /^fight$/i})).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Edit Profile'})).not.toBeInTheDocument();
  });

  it('stays on hub when navigating to fighter select from a game screen with token', async () => {
    const user = userEvent.setup();
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'token-value');
    const gameModule = await import('./index.js');

    renderGame({gameModule, initialPath: '/hub'});
    await user.click(await screen.findByRole('button', {name: 'Go Fighter Select'}));
    expect(await screen.findByRole('heading', {name: 'Hub Screen'})).toBeInTheDocument();
  });

  it('keeps the websocket connected when the game unmounts', async () => {
    const close = vi.fn();
    globalThis.WebSocket = vi.fn(function () {
      return {close, send: vi.fn()};
    });
    const gameModule = await import('./index.js');

    const {unmount} = renderGame({gameModule});
    await screen.findByRole('button', {name: 'Fighter Select'});
    unmount();

    expect(close).toHaveBeenCalledTimes(0);
  });
});

function renderGame({gameModule, initialPath = '/'}) {
  const {
    default: Game,
    fighterSelectLoader,
  } = gameModule;
  const router = createMemoryRouter(
    [
      {
        children: [
          {index: true, element: <Game />, loader: fighterSelectLoader},
          {element: <EditUser />, loader: editUserLoader, path: 'edit-user'},
          {
            children: [
              {element: <Fight />, path: 'fight'},
              {element: <Hub />, path: 'hub'},
              {element: <Shop />, path: 'shop'},
              {element: <Train />, path: 'train'},
              {element: <Fallback />, path: '*'},
            ],
            element: <GameLayout />,
            loader: gameScreenLoader,
          },
        ],
        path: '/',
      },
    ],
    {initialEntries: [initialPath]},
  );
  routerNavigate.mockImplementation((screenPath) => router.navigate(screenPath));
  connectSocketOnAppLoad();

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
