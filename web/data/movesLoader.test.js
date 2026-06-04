import useMovesStore, {resetMovesStore} from './moves.js';


let fetchJSONMock;

vi.mock('@/utils/fetchAPI.js', () => ({
  fetchJSON: (...args) => fetchJSONMock(...args),
}));

describe('loadMoves', () => {
  beforeEach(() => {
    fetchJSONMock = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetMovesStore();
  });

  it('hydrates moves from the api', async () => {
    const moves = [{id: 1, name: 'Wild Punch'}];
    fetchJSONMock.mockResolvedValue(moves);
    const {default: loadMoves} = await import('./movesLoader.js');

    await expect(loadMoves()).resolves.toEqual(moves);
    expect(fetchJSONMock).toHaveBeenCalledWith('moves');
    expect(useMovesStore.getState().moves).toEqual(moves);
  });

  it('returns and stores an empty list on api failure', async () => {
    const error = new Error('network fail');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    useMovesStore.getState().setMoves([{id: 99, name: 'Old Move'}]);
    fetchJSONMock.mockRejectedValue(error);
    const {default: loadMoves} = await import('./movesLoader.js');

    await expect(loadMoves()).resolves.toEqual([]);
    expect(fetchJSONMock).toHaveBeenCalledWith('moves');
    expect(consoleError).toHaveBeenCalledWith('Failed to load moves', error);
    expect(useMovesStore.getState().moves).toEqual([]);
    consoleError.mockRestore();
  });
});
