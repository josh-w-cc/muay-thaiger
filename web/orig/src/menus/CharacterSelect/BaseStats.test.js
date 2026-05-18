import {SEED_STATICS} from '../../../../../api/data/seed-data/seeds/001-sample-board.js';
import BaseStats from './BaseStats.jsx';


describe('BaseStats', () => {
  it('maps race statics into character select data', () => {
    const raceStatics = SEED_STATICS
      .filter((item) => item.type === 'race')
      .sort((left, right) => right.id - left.id);

    expect(Object.keys(BaseStats)).toEqual(raceStatics.map((item) => item.name.replaceAll(' ', '')));

    for(const race of raceStatics) {
      const raceKey = race.name.replaceAll(' ', '');
      expect(BaseStats[raceKey].name).toBe(race.name);
      expect(BaseStats[raceKey].stats).toEqual(race.stats);
    }
  });
});
