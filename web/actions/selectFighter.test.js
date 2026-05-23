import BaseStats from '@/data/baseStats.js';
import useFighterStore, {resetFighterStore} from '@/data/fighter.js';
import usePlayerStore, {resetPlayerStore} from '@/data/player.js';

import selectFighter from './selectFighter.js';


const {selectFighterCmd} = vi.hoisted(() => ({
  selectFighterCmd: vi.fn(),
}));

vi.mock('@/actions/websockets/index.js', () => ({
  selectFighterCmd: (...args) => selectFighterCmd(...args),
}));

describe('selectFighter', () => {
  afterEach(() => {
    vi.clearAllMocks();
    resetFighterStore();
    resetPlayerStore();
  });

  it('updates the fighter store selection', () => {
    const {stats} = BaseStats['2'];

    selectFighter('2');

    const fighter = useFighterStore.getState();

    expect(fighter.race).toBe('2');
    expect(fighter.anima).toBe(stats.anima);
    expect(fighter.durability).toBe(stats.durability);
    expect(fighter.vigor).toBe(stats.vigor);
    expect(fighter.reach).toBe(stats.reach);
    expect(fighter.speed).toBe(stats.speed);
    expect(fighter.vitality).toBe(stats.vitality);
    expect(usePlayerStore.getState().selectedRace).toBe('2');
    expect(selectFighterCmd).toHaveBeenCalledTimes(1);
  });
});
