import BaseStats, {RACES} from './baseStats.js';
import {buildStateFromServerFighter} from './serverFighterState.js';


describe('buildStateFromServerFighter', () => {
  it('falls back to defaults when fighter data has invalid types', () => {
    const state = buildStateFromServerFighter({
      gold: 'not-a-number',
      id: 1.5,
      race: '',
      stats: null,
    });

    const defaultRace = `${RACES[0].id}`;

    expect(state.gold).toBe(0);
    expect(state.id).toBeNull();
    expect(state.race).toBe(defaultRace);
    expect(state.anima).toBe(BaseStats[defaultRace].stats.anima);
    expect(state.speed).toBe(BaseStats[defaultRace].stats.speed);
  });
});
