import BaseStats from './BaseStats.jsx';
import {SEED_STATICS} from '../../../../../api/data/seed-data/seeds/001-sample-board.js';


describe('BaseStats', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uses race statics as the source of truth', () => {
    const raceStatics = [...SEED_STATICS]
      .filter(({type}) => type === 'race')
      .sort((firstRace, secondRace) => secondRace.id - firstRace.id);

    expect(Object.keys(BaseStats)).toEqual(raceStatics.map(({name}) => name.replaceAll(' ', '')));
    expect(BaseStats.Tiger.name).toBe('Tiger');
    expect(BaseStats.SnowLeopard.name).toBe('Snow Leopard');
    expect(BaseStats.Tiger.stats).toEqual(
      raceStatics.find(({name}) => name === 'Tiger').stats,
    );
    expect(BaseStats.SnowLeopard.stats).toEqual(
      raceStatics.find(({name}) => name === 'Snow Leopard').stats,
    );
  });
});
