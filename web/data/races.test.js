import useRacesStore, {resetRacesStore} from './races.js';


describe('useRacesStore', () => {
  afterEach(() => {
    resetRacesStore();
  });

  it('stores races with BigInt stats', () => {
    useRacesStore.getState().setRaces([
      {id: 1, name: 'Tiger', stats: {speed: '4', vigor: 2}},
    ]);

    expect(useRacesStore.getState().races).toEqual([
      {id: 1, name: 'Tiger', stats: {speed: 4n, vigor: 2n}},
    ]);
  });
});
