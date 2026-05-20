const {reconnectingSocketCtor, routerNavigate} = vi.hoisted(() => ({
  reconnectingSocketCtor: vi.fn(),
  routerNavigate: vi.fn(),
}));
vi.mock('reconnecting-websocket', () => ({
  default: reconnectingSocketCtor,
}));
vi.mock('@/router.js', () => ({
  default: {navigate: routerNavigate},
}));

import useFighterStore, {resetFighterStore} from '@/data/fighter.js';
import usePlayerStore, {resetPlayerStore, setPlayerToken} from '@/data/player.js';
import {PLAYER_TOKEN_STORAGE_KEY} from '@/data/playerTokenStorage.js';
import {connectSocketOnAppLoad, createFighterActionCmd, resetSocketState, selectFighterCmd} from './index.js';


describe('player websocket helpers', () => {
  const originalWebSocket = globalThis.WebSocket;
  const originalLocation = globalThis.window.location;
  let warnSpy;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    globalThis.WebSocket = {OPEN: 1};
    reconnectingSocketCtor.mockImplementation(function () {
      return {close: vi.fn(), readyState: 1, send: vi.fn()};
    });
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
    const socketURL = new URL(reconnectingSocketCtor.mock.calls[0][0]);

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
    const socketURL = new URL(reconnectingSocketCtor.mock.calls[0][0]);

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

  it('stores auth player id when provided in auth message', () => {
    const socket = connectSocketOnAppLoad();
    socket.onmessage({data: JSON.stringify({cmd: 'auth', player_id: 77})});

    expect(usePlayerStore.getState().playerID).toBe(77);
  });

  it('overwrites client player and fighter state when player_state is received', () => {
    usePlayerStore.getState().selectFighter('99');
    usePlayerStore.getState().setPlayerID(999);
    useFighterStore.setState({
      agility: 99,
      gold: 999,
      id: 55,
      race: '1',
      stamina: 99,
      strength: 99,
    });
    const socket = connectSocketOnAppLoad();
    const send = vi.fn();
    socket.send = send;
    expect(usePlayerStore.getState().selectedRace).toBe('99');
    expect(usePlayerStore.getState().playerID).toBe(999);
    expect(useFighterStore.getState().race).toBe('1');

    socket.onmessage({
      data: JSON.stringify({
        cmd: 'player_state',
        fighter: {
          gold: '250',
          id: 9,
          player_id: 77,
          race: 2,
          stats: {agility: 6, stamina: 7, strength: 8},
        },
      }),
    });

    expect(usePlayerStore.getState().playerID).toBe(77);
    expect(usePlayerStore.getState().selectedRace).toBe('2');
    expect(useFighterStore.getState().gold).toBe(250);
    expect(useFighterStore.getState().id).toBe(9);
    expect(useFighterStore.getState().race).toBe('2');
    expect(useFighterStore.getState().agility).toBe(6);
    expect(useFighterStore.getState().stamina).toBe(7);
    expect(useFighterStore.getState().strength).toBe(8);
    expect(send).not.toHaveBeenCalled();
  });

  it('sends idle command with action id for fighter actions', () => {
    const socket = connectSocketOnAppLoad();
    const send = vi.fn();
    socket.send = send;

    createFighterActionCmd(2);

    expect(send).toHaveBeenCalledWith(JSON.stringify({action_id: 2, cmd: 'idle'}));
  });

  it('does not send idle command for invalid fighter actions', () => {
    const socket = connectSocketOnAppLoad();
    const send = vi.fn();
    socket.send = send;
    const invalidActionIdentifier = '2';

    createFighterActionCmd(invalidActionIdentifier);

    expect(send).not.toHaveBeenCalled();
  });

  it('reuses the existing websocket connection', () => {
    const firstSocket = connectSocketOnAppLoad();
    const secondSocket = connectSocketOnAppLoad();

    expect(secondSocket).toBe(firstSocket);
    expect(reconnectingSocketCtor).toHaveBeenCalledTimes(1);
  });

  it('ignores player_state messages without fighter data', () => {
    const initialFighterID = useFighterStore.getState().id;
    const socket = connectSocketOnAppLoad();
    socket.onmessage({data: JSON.stringify({cmd: 'player_state'})});

    expect(useFighterStore.getState().id).toBe(initialFighterID);
    expect(routerNavigate).not.toHaveBeenCalled();
  });

  it('silently accepts ok command without sending or warning', () => {
    const socket = connectSocketOnAppLoad();
    const send = vi.fn();
    socket.send = send;

    socket.onmessage({data: JSON.stringify({cmd: 'ok', metadata: {responded_cmd: 'idle'}})});

    expect(send).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
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
});
