import {PLAYER_TOKEN_STORAGE_KEY} from './playerTokenStorage.js';

import usePlayerStore, {loadPlayerToken, resetPlayerStore, setPlayerToken} from './player.js';


const originalLocalStorage = globalThis.localStorage;


describe('usePlayerStore', () => {
  afterEach(() => {
    vi.clearAllMocks();
    if(globalThis.localStorage) {
      localStorage.removeItem(PLAYER_TOKEN_STORAGE_KEY);
    }
    resetPlayerStore();
    setLocalStorage(originalLocalStorage);
  });

  function setLocalStorage(value) {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value,
    });
  }

  it('loads auth token into the player store', () => {
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, 'existing-token');

    expect(loadPlayerToken()).toBe('existing-token');
    expect(usePlayerStore.getState().token).toBe('existing-token');
  });

  it('stores fighter selection in player state', () => {
    usePlayerStore.getState().selectFighter('2');

    expect(usePlayerStore.getState().selectedRace).toBe('2');
  });

  it('stores player name in player state', () => {
    usePlayerStore.getState().setPlayerName('Fighter Joe');

    expect(usePlayerStore.getState().playerName).toBe('Fighter Joe');
  });

  it('stores token in state when localStorage is unavailable', () => {
    setLocalStorage(undefined);

    expect(() => setPlayerToken('existing-token')).not.toThrow();
    expect(usePlayerStore.getState().token).toBe('existing-token');
  });

  it('clears token from state and localStorage', () => {
    setPlayerToken('existing-token');

    usePlayerStore.getState().clearToken();

    expect(localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY)).toBeNull();
    expect(usePlayerStore.getState().token).toBeNull();
  });
});
