import BaseStats, {RACE_STATICS} from './BaseStats.jsx';


describe('BaseStats', () => {
  it('maps race statics into character select data', () => {
    expect(Object.keys(BaseStats)).toEqual(RACE_STATICS.map((item) => `${item.id}`));

    for(const race of RACE_STATICS) {
      const raceKey = `${race.id}`;
      expect(BaseStats[raceKey].id).toBe(race.id);
      expect(BaseStats[raceKey].name).toBe(race.name);
      expect(BaseStats[raceKey].stats).toEqual(race.stats);
    }
  });
});
