import BaseStats, {RACES} from './baseStats.js';


describe('BaseStats', () => {
  it('maps races into fighter select data', () => {
    expect(Object.keys(BaseStats)).toEqual(RACES.map((item) => `${item.id}`));

    for(const race of RACES) {
      const raceKey = `${race.id}`;
      expect(BaseStats[raceKey].id).toBe(race.id);
      expect(BaseStats[raceKey].name).toBe(race.name);
      expect(BaseStats[raceKey].stats).toEqual(race.stats);
    }
  });
});
