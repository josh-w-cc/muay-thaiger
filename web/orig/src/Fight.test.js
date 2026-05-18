import useFightStore, {FIGHT_IN_PROGRESS, FIGHT_NOT_STARTED, FIGHT_WON, resetFightStore} from './Fight.js';


describe('useFightStore', () => {
  afterEach(() => {
    resetFightStore();
    vi.restoreAllMocks();
  });

  it('starts a fight for gold and idles the fighter in fight mode', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const fighter = {
      apm: 10,
      attack: 8,
      defense: 7,
      gold: 1000,
      health: 100,
      idle: vi.fn(),
      power: 9,
      spend: vi.fn(),
      stamina: 20,
      train: vi.fn(),
      win: vi.fn(),
    };

    useFightStore.getState().forGold(fighter, 1);

    const fight = useFightStore.getState();
    expect(fight.bet).toBe(100);
    expect(fight.fighters).toHaveLength(2);
    expect(fight.state).toBe(FIGHT_IN_PROGRESS);
    expect(fighter.idle).toHaveBeenCalledTimes(1);
    expect(fighter.idle).toHaveBeenCalledWith('FIGHT', expect.any(Function));
  });

  it('finishes a won fight by paying out and resetting state', () => {
    const fighter = {
      spend: vi.fn(),
      train: vi.fn(),
      win: vi.fn(),
    };
    useFightStore.setState({
      bet: 250,
      fighters: [{stats: fighter}],
      messages: ['ready'],
      state: FIGHT_WON,
    });

    useFightStore.getState().finish();

    const fight = useFightStore.getState();
    expect(fighter.win).toHaveBeenCalledWith(250);
    expect(fighter.spend).not.toHaveBeenCalled();
    expect(fighter.train).toHaveBeenCalledWith('skill', 1);
    expect(fight.bet).toBe(0);
    expect(fight.fighters).toEqual([]);
    expect(fight.messages).toEqual([]);
    expect(fight.state).toBe(FIGHT_NOT_STARTED);
  });
});
