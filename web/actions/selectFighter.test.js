import useFighterStore, {resetFighterStore} from '@/orig/src/Fighter.js';
import BaseStats from '@/orig/src/menus/CharacterSelect/BaseStats.js';

import selectFighter from './selectFighter.js';


describe('selectFighter', () => {
  afterEach(() => {
    resetFighterStore();
  });

  it('updates the fighter store selection', () => {
    const {stats} = BaseStats['2'];

    selectFighter('2');

    const fighter = useFighterStore.getState();

    expect(fighter.race).toBe('2');
    expect(fighter.anima).toBe(stats.anima);
    expect(fighter.durability).toBe(stats.durability);
    expect(fighter.innateStrength).toBe(stats.strength);
    expect(fighter.reach).toBe(stats.reach);
    expect(fighter.speed).toBe(stats.speed);
    expect(fighter.vitality).toBe(stats.vitality);
  });
});
