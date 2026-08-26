const {routerNavigate} = vi.hoisted(() => ({
  routerNavigate: vi.fn(),
}));

import useFighterActionsStore, {resetFighterActionsStore} from '@/data/fighter/fighterActions.js';
import useFighterStore, {resetFighterStore} from '@/data/fighter/index.js';
import useFightStore, {resetFightStore} from '@/data/fight/index.js';
import usePlayerStore, {resetPlayerStore} from '@/data/player.js';
import {PLAYER_TOKEN_STORAGE_KEY, setPlayerToken} from './state/token.js';
import {setWebsocketRouter} from './state/router.js';
import {
  connectSocketOnAppLoad,
  resetSocketState,
  sendCommand,
} from './index.js';
import {selectFighterCmd} from './clientCommands.js';


describe('player websocket helpers', () => {
  const originalWebSocket = globalThis.WebSocket;
  const originalLocation = globalThis.window.location;
  let debugSpy;
  let errorSpy;
  let infoSpy;
  let warnSpy;

  beforeEach(() => {
    setWebsocketRouter({navigate: routerNavigate});
    debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    globalThis.WebSocket = vi.fn(function () {
      return {close: vi.fn(), readyState: 1, send: vi.fn()};
    });
    globalThis.WebSocket.OPEN = 1;
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    localStorage.clear();
    resetFighterActionsStore();
    resetFighterStore();
    resetFightStore();
    resetPlayerStore();
    resetSocketState();
    setWebsocketRouter(null);
    globalThis.WebSocket = originalWebSocket;
    Object.defineProperty(globalThis.window, 'location', {
      configurable: true,
      value: originalLocation,
    });
    debugSpy.mockRestore();
    errorSpy.mockRestore();
    infoSpy.mockRestore();
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

  it('redirects to /server-down with a hard reload on WebSocket error', () => {
    Object.defineProperty(globalThis.window, 'location', {
      configurable: true,
      value: {href: 'http://localhost/'},
      writable: true,
    });
    const socket = connectSocketOnAppLoad();

    socket.onerror(new Event('error'));

    expect(globalThis.window.location.href).toBe('/server-down');
  });

  it('clears invalid token and redirects to / with hard reload', () => {
    Object.defineProperty(globalThis.window, 'location', {
      configurable: true,
      value: {href: 'http://localhost/'},
      writable: true,
    });
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'existing-token');
    setPlayerToken('existing-token');
    usePlayerStore.getState().selectFighter('1');
    const socket = connectSocketOnAppLoad();
    const send = vi.fn();
    socket.send = send;
    socket.onmessage({data: JSON.stringify({cmd: 'auth'})});
    socket.onmessage({data: JSON.stringify({cmd: 'auth-invalid-token'})});

    expect(localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY)).toBeNull();
    expect(globalThis.window.location.href).toBe('/');
  });

  it('stores auth token and routes to hub when fighter is selected', () => {
    usePlayerStore.getState().selectFighter('1');
    const socket = connectSocketOnAppLoad();
    const send = vi.fn();
    socket.send = send;
    socket.onmessage({data: JSON.stringify({cmd: 'auth', token: 'new-token'})});

    expect(localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY)).toBe('new-token');
    expect(routerNavigate).toHaveBeenCalledWith('/hub');
    expect(send).toHaveBeenCalledWith(JSON.stringify({cmd: 'auth', token: 'new-token'}));
  });

  it('stores auth player id when provided in auth message', () => {
    const socket = connectSocketOnAppLoad();
    socket.onmessage({data: JSON.stringify({cmd: 'auth', player_id: 77})});

    expect(usePlayerStore.getState().playerID).toBe(77);
  });

  it('stores player name when provided in auth message', () => {
    const socket = connectSocketOnAppLoad();
    socket.onmessage({data: JSON.stringify({cmd: 'auth', display_name: 'Player-abc123', player_id: 77})});

    expect(usePlayerStore.getState().playerName).toBe('Player-abc123');
  });

  it('overwrites client player and fighter state when player_state is received', () => {
    usePlayerStore.getState().selectFighter('99');
    usePlayerStore.getState().setPlayerID(999);
    useFighterActionsStore.getState().setActions([{id: 5}]);
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
    useFightStore.setState({id: 100, messages: ['local'], state: 'in-progress'});

    socket.onmessage({
      data: JSON.stringify({
        cmd: 'player_state',
        actions: [{action: 2, id: 11}],
        fight: {
          details: {
            attacker: {
              calculatedStats: {},
              startingStats: {},
              stats: {},
            },
          },
          id: 88,
          reason: 'gold',
          rank: 'bronze',
          victory: 9,
        },
        fighter: {
          gold: '250',
          id: 9,
          player: 77,
          race: 2,
          stats: {agility: 6, stamina: 7, strength: 8},
        },
      }),
    });

    expect(usePlayerStore.getState().playerID).toBe(77);
    expect(usePlayerStore.getState().selectedRace).toBe('2');
    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 2, id: 11}),
    ]);
    expect(useFighterStore.getState().gold).toBe(250n);
    expect(useFighterStore.getState().id).toBe(9);
    expect(useFighterStore.getState().race).toBe('2');
    expect(useFighterStore.getState().agility).toBe(6n);
    expect(useFighterStore.getState().stamina).toBe(7n);
    expect(useFighterStore.getState().strength).toBe(8n);
    expect(useFightStore.getState().id).toBe(88);
    expect(useFightStore.getState().rank).toBe('bronze');
    expect(useFightStore.getState().reason).toBe('gold');
    expect(useFightStore.getState()).not.toHaveProperty('messages');
    expect(useFightStore.getState()).not.toHaveProperty('state');
    expect(send).not.toHaveBeenCalled();
  });

  it('normalizes player_state actions and player id when payload fields are missing', () => {
    usePlayerStore.getState().setPlayerID(999);
    useFighterActionsStore.getState().setActions([{id: 5}]);
    useFightStore.setState({id: 22, messages: ['local'], state: 'in-progress'});
    const socket = connectSocketOnAppLoad();
    socket.onmessage({
      data: JSON.stringify({
        cmd: 'player_state',
        actions: {id: 11},
        fighter: {
          gold: '250',
          id: 9,
          player: null,
          race: 2,
          stats: {agility: 6, stamina: 7, strength: 8},
        },
      }),
    });

    expect(usePlayerStore.getState().playerID).toBeNull();
    expect(useFighterActionsStore.getState().actions).toEqual([]);
    expect(useFightStore.getState().id).toBeNull();
    expect(useFightStore.getState().reason).toBeNull();
    expect(useFightStore.getState()).not.toHaveProperty('messages');
  });

  it('does not route to hub when player_state is received', () => {
    usePlayerStore.getState().selectFighter('1');
    setPlayerToken('existing-token');
    const socket = connectSocketOnAppLoad();

    socket.onmessage({
      data: JSON.stringify({
        cmd: 'player_state',
        fighter: {
          gold: '250',
          id: 9,
          player: 77,
          race: 2,
          stats: {agility: 6, stamina: 7, strength: 8},
        },
      }),
    });

    expect(routerNavigate).not.toHaveBeenCalled();
  });

  it('sends websocket command when socket is ready', () => {
    const socket = connectSocketOnAppLoad();
    const send = vi.fn();
    socket.send = send;

    sendCommand({action_id: 2, cmd: 'idle'});

    expect(send).toHaveBeenCalledWith(JSON.stringify({action_id: 2, cmd: 'idle'}));
    expect(debugSpy).toHaveBeenCalledWith('WebSocket send cmd:', 'idle');
  });

  it('reconnects and sends websocket command when socket is unavailable', () => {
    const unavailableSocket = connectSocketOnAppLoad();
    unavailableSocket.readyState = 0;

    sendCommand({action_id: 2, cmd: 'idle'});

    const reconnectedSocket = globalThis.WebSocket.mock.results[1].value;
    expect(globalThis.WebSocket).toHaveBeenCalledTimes(2);
    expect(unavailableSocket.close).toHaveBeenCalledTimes(1);
    expect(reconnectedSocket.send).toHaveBeenCalledWith(JSON.stringify({action_id: 2, cmd: 'idle'}));
  });

  it('does not send websocket command when no ready socket is available', () => {
    globalThis.WebSocket = vi.fn(function () {
      return {close: vi.fn(), readyState: 0, send: vi.fn()};
    });
    globalThis.WebSocket.OPEN = 1;
    resetSocketState();

    sendCommand({action_id: 2, cmd: 'idle'});

    const socket = globalThis.WebSocket.mock.results[0].value;
    expect(socket.send).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalledWith('WebSocket send cmd:', 'idle');
  });

  it('reconnects when selecting fighter with unavailable websocket', () => {
    usePlayerStore.getState().selectFighter('1');
    const unavailableSocket = connectSocketOnAppLoad();
    unavailableSocket.readyState = 0;

    selectFighterCmd();

    expect(globalThis.WebSocket).toHaveBeenCalledTimes(2);
    expect(unavailableSocket.close).toHaveBeenCalledTimes(1);
  });

  it('reuses the existing websocket connection', () => {
    const firstSocket = connectSocketOnAppLoad();
    const secondSocket = connectSocketOnAppLoad();

    expect(secondSocket).toBe(firstSocket);
    expect(globalThis.WebSocket).toHaveBeenCalledTimes(1);
  });

  it('reconnects after fifteen minutes without websocket commands', () => {
    vi.useFakeTimers();
    const firstSocket = connectSocketOnAppLoad();
    const firstSocketClose = vi.fn();
    firstSocket.close = firstSocketClose;

    vi.advanceTimersByTime(15 * 60 * 1000);

    const secondSocket = connectSocketOnAppLoad();
    expect(secondSocket).not.toBe(firstSocket);
    expect(firstSocketClose).toHaveBeenCalledTimes(1);
    expect(globalThis.WebSocket).toHaveBeenCalledTimes(2);
  });

  it('ignores player_state messages without fighter data', () => {
    const initialFighterID = useFighterStore.getState().id;
    const socket = connectSocketOnAppLoad();
    socket.onmessage({data: JSON.stringify({cmd: 'player_state'})});

    expect(useFighterStore.getState().id).toBe(initialFighterID);
    expect(routerNavigate).not.toHaveBeenCalled();
  });

  it('ignores ok command metadata without sending or warning', () => {
    const socket = connectSocketOnAppLoad();
    const send = vi.fn();
    socket.send = send;
    const fighterAction = {action: 2, id: 15};

    socket.onmessage({data: JSON.stringify({cmd: 'ok', metadata: {fighterAction, responded_cmd: 'idle'}})});

    expect(useFighterActionsStore.getState().actions).toEqual([]);
    expect(send).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('ignores ok command metadata when not idle fighter action', () => {
    const socket = connectSocketOnAppLoad();
    useFighterActionsStore.getState().setActions([{id: 1}]);

    socket.onmessage({data: JSON.stringify({cmd: 'ok', metadata: {responded_cmd: 'idle'}})});
    socket.onmessage({
      data: JSON.stringify({cmd: 'ok', metadata: {fighterAction: {id: 2}, responded_cmd: 'auth'}}),
    });

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({id: 1}),
    ]);
  });

  it('ignores invalid websocket messages and logs unknown commands', () => {
    const socket = connectSocketOnAppLoad();
    const send = vi.fn();
    socket.send = send;

    socket.onmessage({data: '{'});
    socket.onmessage({data: JSON.stringify({cmd: 'noop'})});

    expect(send).not.toHaveBeenCalled();
    expect(debugSpy).toHaveBeenCalledWith('WebSocket recv invalid message');
    expect(debugSpy).toHaveBeenCalledWith('WebSocket recv cmd:', 'noop');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('Unknown websocket cmd:', 'noop');
  });
});
