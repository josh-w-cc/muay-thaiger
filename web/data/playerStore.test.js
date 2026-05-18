import usePlayerStore, {PLAYER_TOKEN_STORAGE_KEY, resetPlayerStore} from './playerStore.js';


const originalWebSocket = globalThis.WebSocket;
const originalLocalStorage = globalThis.localStorage;


describe('usePlayerStore', () => {
  beforeEach(() => {
    globalThis.WebSocket = {OPEN: 1};
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetPlayerStore();
    setLocalStorage(originalLocalStorage);
    globalThis.WebSocket = originalWebSocket;
    if(globalThis.localStorage) {
      localStorage.removeItem(PLAYER_TOKEN_STORAGE_KEY);
    }
  });

  it('responds with auth/new after auth when fighter is selected', () => {
    const send = vi.fn();
    const socket = {readyState: 1, send};
    const setScreen = vi.fn();

    usePlayerStore.setState({hasReceivedAuthRequest: true});
    usePlayerStore.getState().onFighterSelect({race: '1', setScreen, socket});

    expect(send).toHaveBeenCalledWith(JSON.stringify({cmd: 'auth', race: '1', token: 'new'}));
    expect(setScreen).not.toHaveBeenCalled();
  });

  it('stores auth token and routes to hub when fighter is already selected', () => {
    const send = vi.fn();
    const socket = {readyState: 1, send};
    const setScreen = vi.fn();

    usePlayerStore.setState({hasSelectedFighter: true, selectedRace: '1'});
    usePlayerStore.getState().onSocketMessage({message: {token: 'new-token', type: 'auth'}, setScreen, socket});

    expect(localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY)).toBe('new-token');
    expect(setScreen).toHaveBeenCalledWith('hub');
  });

  it('clears invalid token and retries auth with a new token', () => {
    const send = vi.fn();
    const socket = {readyState: 1, send};
    const setScreen = vi.fn();
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'existing-token');

    usePlayerStore.setState({
      hasReceivedAuthRequest: true,
      hasRespondedToAuth: true,
      hasSelectedFighter: true,
      selectedRace: '1',
    });
    usePlayerStore.getState().onSocketMessage({message: {type: 'auth-invalid-token'}, setScreen, socket});

    expect(localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY)).toBeNull();
    expect(send).toHaveBeenCalledWith(JSON.stringify({cmd: 'auth', race: '1', token: 'new'}));
    expect(setScreen).not.toHaveBeenCalled();
  });

  function setLocalStorage(value) {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value,
    });
  }
});
