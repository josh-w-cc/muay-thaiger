import BaseStats from './BaseStats.jsx';


describe('BaseStats', () => {
  it('maps race statics into character select data', () => {
    const raceStatics = [
      {
        id: 2,
        name: 'Snow Leopard',
        stats: {anima: 2, durability: 2, reach: 1, speed: 2, strength: 1, vitality: 1},
      },
      {
        id: 1,
        name: 'Tiger',
        stats: {anima: 1, durability: 1, reach: 2, speed: 1, strength: 2, vitality: 2},
      },
    ];

    expect(Object.keys(BaseStats)).toEqual(raceStatics.map((item) => item.name.replaceAll(' ', '')));

    for(const race of raceStatics) {
      const raceKey = race.name.replaceAll(' ', '');
      expect(BaseStats[raceKey].id).toBe(race.id);
      expect(BaseStats[raceKey].name).toBe(race.name);
      expect(BaseStats[raceKey].stats).toEqual(race.stats);
    }
  });
});
