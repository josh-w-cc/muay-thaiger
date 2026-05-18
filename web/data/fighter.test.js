import BaseStats, {RACE_STATICS} from '@/orig/src/menus/CharacterSelect/BaseStats.js';

import useFighterStore, {resetFighterStore} from './fighter.js';


describe('useFighterStore', () => {
  afterEach(() => {
    resetFighterStore();
    vi.restoreAllMocks();
  });

  it('initializes with the default race and derived combat stats', () => {
    const fighter = useFighterStore.getState();
    const initialRace = `${RACE_STATICS[0].id}`;

    expect(fighter.race).toBe(initialRace);
    expect(fighter.anima).toBe(BaseStats[initialRace].stats.anima);
    expect(fighter.durability).toBe(BaseStats[initialRace].stats.durability);
    expect(fighter.innateStrength).toBe(BaseStats[initialRace].stats.strength);
    expect(fighter.reach).toBe(BaseStats[initialRace].stats.reach);
    expect(fighter.speed).toBe(BaseStats[initialRace].stats.speed);
    expect(fighter.vitality).toBe(BaseStats[initialRace].stats.vitality);
    expect(fighter.apm).toBe(0);
    expect(fighter.attack).toBe(BaseStats[initialRace].stats.reach);
    expect(fighter.defense).toBe(0);
    expect(fighter.health).toBe(BaseStats[initialRace].stats.durability * BaseStats[initialRace].stats.durability);
    expect(fighter.power).toBe(0);
  });

  it('recomputes derived combat stats after training', () => {
    const fighter = useFighterStore.getState();

    fighter.train('stamina');
    fighter.train('strength');

    const trainedFighter = useFighterStore.getState();

    expect(trainedFighter.stamina).toBe(2);
    expect(trainedFighter.strength).toBe(2);
    expect(trainedFighter.attack).toBeCloseTo(2.6931471805599454);
    expect(trainedFighter.defense).toBeCloseTo(1.4142135623730951);
    expect(trainedFighter.health).toBe(3);
    expect(trainedFighter.power).toBeCloseTo(2.8284271247461903);
  });

  it('ticks idle training actions through the Zustand store', () => {
    const fighter = useFighterStore.getState();

    fighter.idle('train-strength', () => useFighterStore.getState().train('strength'));
    fighter.tick(1001);

    const idlingFighter = useFighterStore.getState();

    expect(idlingFighter.strength).toBe(2);
    expect(idlingFighter.idling.delta).toBe(1);
    expect(idlingFighter.power).toBe(0);
  });
});
