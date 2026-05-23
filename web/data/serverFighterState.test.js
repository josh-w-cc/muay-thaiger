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
    expect(state.createdAt).toBeNull();
    expect(state.displayName).toBe('');
  });

  it('uses fighter data values when they are valid', () => {
    const state = buildStateFromServerFighter({
      created_at: '2026-01-01T00:00:00.000Z',
      display_name: 'Iron Fist',
      gold: '250',
      id: 5,
      race: 2,
      stats: {agility: 7, stamina: 8, strength: 9},
    });

    expect(state.gold).toBe(250);
    expect(state.id).toBe(5);
    expect(state.race).toBe('2');
    expect(state.agility).toBe(7);
    expect(state.stamina).toBe(8);
    expect(state.strength).toBe(9);
    expect(state.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(state.displayName).toBe('Iron Fist');
  });
});
