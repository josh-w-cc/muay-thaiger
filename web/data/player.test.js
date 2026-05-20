import usePlayerStore, {resetPlayerStore} from './player.js';


describe('usePlayerStore', () => {
  afterEach(() => {
    vi.clearAllMocks();
    resetPlayerStore();
  });

  it('stores fighter selection in player state', () => {
    usePlayerStore.getState().selectFighter('2');

    expect(usePlayerStore.getState().selectedRace).toBe('2');
  });

  it('stores player name in player state', () => {
    usePlayerStore.getState().setPlayerName('Fighter Joe');

    expect(usePlayerStore.getState().playerName).toBe('Fighter Joe');
  });

  it('stores token in state', () => {
    usePlayerStore.getState().setToken('existing-token');
    expect(usePlayerStore.getState().token).toBe('existing-token');
  });

  it('clears token from state', () => {
    usePlayerStore.getState().setToken('existing-token');

    usePlayerStore.getState().clearToken();

    expect(usePlayerStore.getState().token).toBeNull();
  });
});
