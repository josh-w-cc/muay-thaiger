import {PLAYER_TOKEN_STORAGE_KEY} from './playerTokenStorage.js';

const {routerNavigate} = vi.hoisted(() => ({
  routerNavigate: vi.fn(),
}));
vi.mock('@/router.js', () => ({
  default: {navigate: routerNavigate},
}));

import usePlayerStore, {loadPlayerToken, resetPlayerStore, setPlayerToken} from './player.js';


const originalWebSocket = globalThis.WebSocket;
const originalLocalStorage = globalThis.localStorage;


describe('usePlayerStore', () => {
  beforeEach(() => {
    globalThis.WebSocket = {OPEN: 1};
  });

  afterEach(() => {
    vi.clearAllMocks();
    if(globalThis.localStorage) {
      localStorage.removeItem(PLAYER_TOKEN_STORAGE_KEY);
    }
    resetPlayerStore();
    setLocalStorage(originalLocalStorage);
    globalThis.WebSocket = originalWebSocket;
  });

  function setLocalStorage(value) {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value,
    });
  }

  it('sends auth/new after fighter selection when auth request is received', () => {
    const send = vi.fn();
    const socket = {readyState: 1, send};

    usePlayerStore.setState({hasReceivedAuthRequest: true});
    usePlayerStore.getState().onFighterSelect({race: '1', socket});

    expect(send).toHaveBeenCalledWith(JSON.stringify({cmd: 'auth', race: '1', token: 'new'}));
    expect(routerNavigate).not.toHaveBeenCalled();
  });

  it('stores auth token and routes to hub when fighter is already selected', () => {
    const send = vi.fn();
    const socket = {readyState: 1, send};

    usePlayerStore.setState({hasSelectedFighter: true, selectedRace: '1'});
    usePlayerStore.getState().onSocketMessage({message: {token: 'new-token', type: 'auth'}, socket});

    expect(localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY)).toBe('new-token');
    expect(usePlayerStore.getState().token).toBe('new-token');
    expect(routerNavigate).toHaveBeenCalledWith('/hub');
  });

  it('loads auth token into the player store', () => {
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'existing-token');

    expect(loadPlayerToken()).toBe('existing-token');
    expect(usePlayerStore.getState().token).toBe('existing-token');
  });

  it('clears invalid token and retries auth with a new token', () => {
    const send = vi.fn();
    const socket = {readyState: 1, send};
    setPlayerToken('existing-token');

    usePlayerStore.setState({
      hasReceivedAuthRequest: true,
      hasRespondedToAuth: true,
      hasSelectedFighter: true,
      selectedRace: '1',
    });
    usePlayerStore.getState().onSocketMessage({message: {type: 'auth-invalid-token'}, socket});

    expect(localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY)).toBeNull();
    expect(usePlayerStore.getState().token).toBeNull();
    expect(send).toHaveBeenCalledWith(JSON.stringify({cmd: 'auth', race: '1', token: 'new'}));
    expect(routerNavigate).not.toHaveBeenCalled();
  });
});
