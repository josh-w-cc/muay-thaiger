const {routerNavigate} = vi.hoisted(() => ({
  routerNavigate: vi.fn(),
}));
vi.mock('@/router.js', () => ({
  default: {navigate: routerNavigate},
}));

import {PLAYER_TOKEN_STORAGE_KEY} from './playerTokenStorage.js';
import {generateOnSocketMessageFn, selectFighterCmd} from './websocket.js';


describe('player websocket helpers', () => {
  beforeEach(() => {
    globalThis.WebSocket = {OPEN: 1};
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('sends auth/new after fighter selection when auth request is received', () => {
    const send = vi.fn();
    const socket = {readyState: 1, send};
    const state = {
      hasReceivedAuthRequest: true,
      hasRespondedToAuth: false,
      hasSelectedFighter: true,
      selectedRace: '1',
      token: null,
    };
    const get = () => state;
    const set = (updates) => Object.assign(state, updates);

    selectFighterCmd({get, set, socket});

    expect(send).toHaveBeenCalledWith(JSON.stringify({cmd: 'auth', race: '1', token: 'new'}));
    expect(routerNavigate).not.toHaveBeenCalled();
  });

  it('does not set fighter selection state', () => {
    const send = vi.fn();
    const socket = {readyState: 1, send};
    const state = {
      hasReceivedAuthRequest: true,
      hasRespondedToAuth: false,
      hasSelectedFighter: false,
      selectedRace: null,
      token: null,
    };
    const get = () => state;
    const set = (updates) => Object.assign(state, updates);

    selectFighterCmd({get, set, socket});

    expect(state.hasSelectedFighter).toBe(false);
    expect(state.selectedRace).toBeNull();
    expect(send).not.toHaveBeenCalled();
  });

  it('clears invalid token and retries auth with a new token', () => {
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'existing-token');
    const send = vi.fn();
    const socket = {readyState: 1, send};
    const state = {
      hasReceivedAuthRequest: true,
      hasRespondedToAuth: true,
      hasSelectedFighter: true,
      selectedRace: '1',
      token: 'existing-token',
    };
    const get = () => state;
    const set = (updates) => Object.assign(state, updates);

    generateOnSocketMessageFn({get, set})({message: {type: 'auth-invalid-token'}, socket});

    expect(localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY)).toBeNull();
    expect(state.token).toBeNull();
    expect(send).toHaveBeenCalledWith(JSON.stringify({cmd: 'auth', race: '1', token: 'new'}));
  });

  it('stores auth token and routes to hub when fighter is selected', () => {
    const send = vi.fn();
    const socket = {readyState: 1, send};
    const state = {
      hasReceivedAuthRequest: false,
      hasRespondedToAuth: false,
      hasSelectedFighter: true,
      selectedRace: '1',
      token: null,
    };
    state.setToken = vi.fn((token) => {
      state.token = token;
    });
    const get = () => state;
    const set = (updates) => Object.assign(state, updates);

    generateOnSocketMessageFn({get, set})({message: {token: 'new-token', type: 'auth'}, socket});

    expect(state.setToken).toHaveBeenCalledWith('new-token');
    expect(routerNavigate).toHaveBeenCalledWith('/hub');
    expect(send).toHaveBeenCalledWith(JSON.stringify({cmd: 'auth', token: 'new-token'}));
  });
});
