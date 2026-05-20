import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createMemoryRouter, RouterProvider, useNavigate} from 'react-router-dom';

import selectFighter from '@/actions/selectFighter.js';
import {resetPlayerStore, setPlayerToken} from '@/data/player.js';
import {PLAYER_TOKEN_STORAGE_KEY} from '@/data/playerTokenStorage.js';
import {connectSocketOnAppLoad, resetSocketState} from '@/actions/websockets/index.js';


const originalWebSocket = globalThis.WebSocket;
const originalLocalStorage = globalThis.localStorage;
const originalWindow = globalThis.window;
let fetchJSONMock;
const {reconnectingSocketCtor, routerNavigate} = vi.hoisted(() => ({
  reconnectingSocketCtor: vi.fn(),
  routerNavigate: vi.fn(),
}));

vi.mock('./FighterSelect', () => ({
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

vi.mock('./Fight', () => ({
  default: function MockFight() {
    return <h2>Fight Screen</h2>;
  },
}));

vi.mock('./Hub.js', () => ({
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

vi.mock('./Shop', () => ({
  default: function MockShop() {
    return <h2>Shop Screen</h2>;
  },
}));

vi.mock('./Train', () => ({
  default: function MockTrain() {
    return <h2>Train Screen</h2>;
  },
}));

vi.mock('@/utils/fetchAPI.js', () => ({
  fetchJSON: (...args) => fetchJSONMock(...args),
}));
vi.mock('reconnecting-websocket', () => ({
  default: reconnectingSocketCtor,
}));
vi.mock('@/router.js', () => ({
  default: {navigate: (...args) => routerNavigate(...args)},
}));

describe('Game', () => {
  beforeEach(() => {
    fetchJSONMock = vi.fn().mockResolvedValue([]);
    globalThis.WebSocket = {OPEN: 1};
    reconnectingSocketCtor.mockImplementation(function () {
      return {close: vi.fn(), readyState: 1, send: vi.fn()};
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    if(globalThis.localStorage) {
      localStorage.removeItem(PLAYER_TOKEN_STORAGE_KEY);
    }
    resetSocketState();
    resetPlayerStore();
    setLocalStorage(originalLocalStorage);
    globalThis.WebSocket = originalWebSocket;
    globalThis.window = originalWindow;
  });

  it('loader redirects to hub from index when token exists', async () => {
    const {fighterSelectLoader} = await import('./index.js');
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'token-value');

    const response = await fighterSelectLoader();

    expect(response.headers.get('Location')).toBe('/hub');
    expect(response.status).toBe(302);
  });

  it('loader fetches races for fighter select', async () => {
    const races = [{id: 1, name: 'Tiger', stats: {}}];
    fetchJSONMock.mockResolvedValue(races);
    const {fighterSelectLoader} = await import('./index.js');

    expect(await fighterSelectLoader()).toEqual(races);
    expect(fetchJSONMock).toHaveBeenCalledWith('race');
  });

  it('loader returns null for token-protected screens when token exists', async () => {
    const {gameScreenLoader} = await import('./index.js');
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'token-value');

    expect(await gameScreenLoader()).toBeNull();
  });

  it('loader redirects to fighter select for token-protected screens when token is missing', async () => {
    const {gameScreenLoader} = await import('./index.js');

    const response = await gameScreenLoader();

    expect(response.headers.get('Location')).toBe('/');
    expect(response.status).toBe(302);
  });

  it('loader redirects to fighter select when localStorage is unavailable', async () => {
    const {gameScreenLoader} = await import('./index.js');
    setLocalStorage(undefined);

    const response = await gameScreenLoader();

    expect(response.headers.get('Location')).toBe('/');
    expect(response.status).toBe(302);
  });

  it('loader returns an empty list when races request fails', async () => {
    const {fighterSelectLoader} = await import('./index.js');
    const error = new Error('network failure');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchJSONMock.mockRejectedValue(error);

    expect(await fighterSelectLoader()).toEqual([]);
    expect(fetchJSONMock).toHaveBeenCalledWith('race');
    expect(consoleError).toHaveBeenCalledWith('Failed to load races', error);
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
      expect(reconnectingSocketCtor).toHaveBeenCalled();
    });
    const socketURL = new URL(reconnectingSocketCtor.mock.calls[0][0]);

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
      expect(reconnectingSocketCtor).toHaveBeenCalled();
    });
    const socketURL = new URL(reconnectingSocketCtor.mock.calls[0][0]);

    expect(socketURL.protocol).toBe('wss:');
  });

  it('renders each game screen from header controls', async () => {
    const user = userEvent.setup();
    const socket = {close: vi.fn(), readyState: 1, send: vi.fn()};
    reconnectingSocketCtor.mockImplementation(function () {
      return socket;
    });
    const gameModule = await import('./index.js');

    renderGame({gameModule});
    await user.click(await screen.findByRole('button', {name: 'Fighter Select'}));
    act(() => {
      socket.onmessage({data: JSON.stringify({cmd: 'auth', token: 'new'})});
    });

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
    reconnectingSocketCtor.mockImplementation(function () {
      return socket;
    });
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
    reconnectingSocketCtor.mockImplementation(function () {
      return socket;
    });
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
    reconnectingSocketCtor.mockImplementation(function () {
      return socket;
    });
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
    reconnectingSocketCtor.mockImplementation(function () {
      return socket;
    });
    const gameModule = await import('./index.js');

    renderGame({gameModule});
    await screen.findByRole('button', {name: 'Fighter Select'});
    socket.onmessage({data: JSON.stringify({cmd: 'auth', token: 'new'})});

    await waitFor(() => {
      expect(localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY)).toBe('new');
    });
  });

  it('clears invalid auth token and retries auth with new token', async () => {
    const user = userEvent.setup();
    const send = vi.fn();
    const socket = {close: vi.fn(), readyState: 1, send};
    reconnectingSocketCtor.mockImplementation(function () {
      return socket;
    });
    const gameModule = await import('./index.js');

    renderGame({gameModule});
    await screen.findByRole('button', {name: 'Fighter Select'});
    setPlayerToken('existing-token');
    socket.onmessage({data: JSON.stringify({cmd: 'auth'})});
    await user.click(screen.getByRole('button', {name: 'Fighter Select'}));
    socket.onmessage({data: JSON.stringify({cmd: 'auth-invalid-token'})});

    expect(localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY)).toBeNull();
    expect(send).toHaveBeenNthCalledWith(1, JSON.stringify({cmd: 'auth', token: 'existing-token'}));
    expect(send).toHaveBeenNthCalledWith(2, JSON.stringify({cmd: 'auth', race: '1', token: 'new'}));
  });

  it('retries auth with new token when localStorage is unavailable', async () => {
    const user = userEvent.setup();
    const send = vi.fn();
    const socket = {close: vi.fn(), readyState: 1, send};
    reconnectingSocketCtor.mockImplementation(function () {
      return socket;
    });
    const gameModule = await import('./index.js');

    setLocalStorage(undefined);
    renderGame({gameModule});
    await screen.findByRole('button', {name: 'Fighter Select'});
    socket.onmessage({data: JSON.stringify({cmd: 'auth'})});
    await user.click(screen.getByRole('button', {name: 'Fighter Select'}));
    socket.onmessage({data: JSON.stringify({cmd: 'auth-invalid-token'})});

    expect(send).toHaveBeenNthCalledWith(1, JSON.stringify({cmd: 'auth', race: '1', token: 'new'}));
    expect(send).toHaveBeenNthCalledWith(2, JSON.stringify({cmd: 'auth', race: '1', token: 'new'}));
  });

  it('ignores invalid websocket auth messages', async () => {
    const user = userEvent.setup();
    const send = vi.fn();
    const socket = {close: vi.fn(), readyState: 1, send};
    reconnectingSocketCtor.mockImplementation(function () {
      return socket;
    });
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
    reconnectingSocketCtor.mockImplementation(function () {
      return socket;
    });
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
    reconnectingSocketCtor.mockImplementation(function () {
      return socket;
    });
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
    reconnectingSocketCtor.mockImplementation(function () {
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
    FallbackScreen,
    FightScreen,
    GameLayout,
    fighterSelectLoader,
    gameScreenLoader,
    HubScreen,
    ShopScreen,
    TrainScreen,
  } = gameModule;
  const router = createMemoryRouter(
    [
      {
        children: [
          {index: true, element: <Game />, loader: fighterSelectLoader},
          {
            children: [
              {element: <FightScreen />, path: 'fight'},
              {element: <HubScreen />, path: 'hub'},
              {element: <ShopScreen />, path: 'shop'},
              {element: <TrainScreen />, path: 'train'},
              {element: <FallbackScreen />, path: '*'},
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
