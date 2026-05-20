const {routerNavigate} = vi.hoisted(() => ({
  routerNavigate: vi.fn(),
}));
vi.mock('@/router.js', () => ({
  default: {navigate: routerNavigate},
}));

import useFighterStore, {resetFighterStore} from './fighter.js';
import usePlayerStore, {resetPlayerStore, setPlayerToken} from './player.js';
import {PLAYER_TOKEN_STORAGE_KEY} from './playerTokenStorage.js';
import {connectSocketOnAppLoad, createFighterActionCmd, resetSocketState, selectFighterCmd} from './websocket.js';


describe('player websocket helpers', () => {
  const originalWebSocket = globalThis.WebSocket;
  const originalLocation = globalThis.window.location;
  let warnSpy;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    globalThis.WebSocket = vi.fn(function () {
      return {close: vi.fn(), readyState: 1, send: vi.fn()};
    });
    globalThis.WebSocket.OPEN = 1;
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    resetFighterStore();
    resetPlayerStore();
    resetSocketState();
    globalThis.WebSocket = originalWebSocket;
    Object.defineProperty(globalThis.window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    warnSpy.mockRestore();
  });

  it('sends a new auth command after fighter selection when auth request is received', () => {
    const socket = connectSocketOnAppLoad();
    const send = vi.fn();
    socket.send = send;
    socket.onmessage({data: JSON.stringify({cmd: 'auth'})});
    usePlayerStore.getState().selectFighter('1');
    selectFighterCmd();

    expect(send).toHaveBeenCalledWith(JSON.stringify({cmd: 'auth', race: '1', token: 'new'}));
    expect(routerNavigate).not.toHaveBeenCalled();
  });

  it('connects to /ws/connect using the current host', () => {
    connectSocketOnAppLoad();
    const socketURL = new URL(globalThis.WebSocket.mock.calls[0][0]);

    expect(socketURL.host).toBe(window.location.host);
    expect(socketURL.pathname).toBe('/ws/connect');
    expect(socketURL.protocol).toBe('ws:');
  });

  it('uses secure WebSocket protocol on https pages', () => {
    Object.defineProperty(globalThis.window, 'location', {
      configurable: true,
      enumerable: true,
      value: new URL('https://example.test/game'),
      writable: true,
    });

    connectSocketOnAppLoad();
    const socketURL = new URL(globalThis.WebSocket.mock.calls[0][0]);

    expect(socketURL.protocol).toBe('wss:');
  });

  it('does not send auth when the fighter race is not selected', () => {
    const socket = connectSocketOnAppLoad();
    const send = vi.fn();
    socket.send = send;
    socket.onmessage({data: JSON.stringify({cmd: 'auth'})});

    expect(usePlayerStore.getState().selectedRace).toBeNull();
    selectFighterCmd();

    expect(send).toHaveBeenCalledTimes(0);
    expect(routerNavigate).not.toHaveBeenCalled();
  });

  it('clears invalid token and retries auth with a new token', () => {
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'existing-token');
    setPlayerToken('existing-token');
    usePlayerStore.getState().selectFighter('1');
    const socket = connectSocketOnAppLoad();
    const send = vi.fn();
    socket.send = send;
    socket.onmessage({data: JSON.stringify({cmd: 'auth'})});
    socket.onmessage({data: JSON.stringify({cmd: 'auth-invalid-token'})});

    expect(localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY)).toBeNull();
    expect(usePlayerStore.getState().token).toBeNull();
    expect(send).toHaveBeenCalledWith(JSON.stringify({cmd: 'auth', race: '1', token: 'new'}));
  });

  it('stores auth token and routes to hub when fighter is selected', () => {
    usePlayerStore.getState().selectFighter('1');
    const socket = connectSocketOnAppLoad();
    const send = vi.fn();
    socket.send = send;
    socket.onmessage({data: JSON.stringify({cmd: 'auth', token: 'new-token'})});

    expect(usePlayerStore.getState().token).toBe('new-token');
    expect(routerNavigate).toHaveBeenCalledWith('/hub');
    expect(send).toHaveBeenCalledWith(JSON.stringify({cmd: 'auth', token: 'new-token'}));
  });

  it('sends idle command with action id for fighter actions', () => {
    const socket = connectSocketOnAppLoad();
    const send = vi.fn();
    socket.send = send;

    createFighterActionCmd(2);

    expect(send).toHaveBeenCalledWith(JSON.stringify({action_id: 2, cmd: 'idle'}));
  });

  it('ignores invalid websocket messages and logs unknown commands', () => {
    const socket = connectSocketOnAppLoad();
    const send = vi.fn();
    socket.send = send;

    socket.onmessage({data: '{'});
    socket.onmessage({data: JSON.stringify({cmd: 'noop'})});

    expect(send).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('Unknown websocket cmd:', 'noop');
  });

  it('updates fighter actions from player_state message', () => {
    const socket = connectSocketOnAppLoad();
    const actions = [{action_id: 1, fighter_id: 9, id: 5}];

    socket.onmessage({data: JSON.stringify({actions, cmd: 'player_state', fighter: {id: 9}})});

    expect(useFighterStore.getState().actions).toEqual(actions);
  });

  it('clears fighter actions when player_state has no actions', () => {
    useFighterStore.setState({actions: [{action_id: 1, fighter_id: 9, id: 5}]});
    const socket = connectSocketOnAppLoad();

    socket.onmessage({data: JSON.stringify({cmd: 'player_state', fighter: {id: 9}})});

    expect(useFighterStore.getState().actions).toEqual([]);
  });
});
