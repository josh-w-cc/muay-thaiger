import BaseStats, {RACES} from './baseStats.js';

import useFighterStore, {resetFighterStore} from './fighter.js';


describe('useFighterStore', () => {
  afterEach(() => {
    resetFighterStore();
    vi.restoreAllMocks();
  });

  it('initializes with the default race and derived combat stats', () => {
    const fighter = useFighterStore.getState();
    const initialRace = `${RACES[0].id}`;

    expect(fighter.race).toBe(initialRace);
    expect(fighter.anima).toBe(BaseStats[initialRace].stats.anima);
    expect(fighter.durability).toBe(BaseStats[initialRace].stats.durability);
    expect(fighter.vigor).toBe(BaseStats[initialRace].stats.vigor);
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

  it('does not replace fight idling with a new idle action', () => {
    useFighterStore.setState({
      idling: {action: vi.fn(), delta: 0, key: 'FIGHT-club'},
    });

    useFighterStore.getState().idle('train-strength', vi.fn());

    expect(useFighterStore.getState().idling.key).toBe('FIGHT-club');
  });

  it('returns early when ticking without an idle action', () => {
    useFighterStore.getState().tick(50);

    expect(useFighterStore.getState().idling).toBe(false);
  });

  it('keeps non-training idle actions active until they report completion', () => {
    const action = vi.fn().mockReturnValue(false);
    useFighterStore.setState({
      idling: {action, delta: 0, key: 'shop-refresh'},
    });

    useFighterStore.getState().tick(25);

    expect(action).toHaveBeenCalledWith(25);
    expect(useFighterStore.getState().idling.key).toBe('shop-refresh');
  });

  it('clears non-training idle actions once they finish', () => {
    const action = vi.fn().mockReturnValue(true);
    useFighterStore.setState({
      idling: {action, delta: 0, key: 'shop-refresh'},
    });

    useFighterStore.getState().tick(25);

    expect(action).toHaveBeenCalledWith(25);
    expect(useFighterStore.getState().idling).toBe(false);
  });

  it('trains while a fight is idling', () => {
    useFighterStore.setState({
      idling: {action: vi.fn(), delta: 0, key: 'FIGHT-club'},
      strength: 0,
      vigor: 1,
    });

    useFighterStore.getState().train('strength');

    expect(useFighterStore.getState().strength).toBe(1);
  });

  it('logs and ignores unknown training stats', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    useFighterStore.getState().train('charisma');

    expect(error).toHaveBeenCalledWith('Tried to train unknown stat:', 'charisma');
    expect(useFighterStore.getState().strength).toBe(0);
    error.mockRestore();
  });
});
