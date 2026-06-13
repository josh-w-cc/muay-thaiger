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

  it('stores an empty race list when the payload is not an array', () => {
    useRacesStore.getState().setRaces(null);

    expect(useRacesStore.getState().races).toEqual([]);
  });

  it('normalizes missing race stats to empty objects', () => {
    useRacesStore.getState().setRaces([
      {id: 2, name: 'Lynx'},
    ]);

    expect(useRacesStore.getState().races).toEqual([
      {id: 2, name: 'Lynx', stats: {}},
    ]);
  });
});
