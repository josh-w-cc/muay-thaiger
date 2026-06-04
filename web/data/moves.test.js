import useMovesStore, {resetMovesStore} from './moves.js';


describe('useMovesStore', () => {
  afterEach(() => {
    resetMovesStore();
  });

  it('stores provided moves', () => {
    useMovesStore.getState().setMoves([{id: 1, name: 'Wild Punch'}]);

    expect(useMovesStore.getState().moves).toEqual([{id: 1, name: 'Wild Punch'}]);
  });

  it('stores an empty list for invalid move payloads', () => {
    useMovesStore.getState().setMoves(null);

    expect(useMovesStore.getState().moves).toEqual([]);
  });
});
