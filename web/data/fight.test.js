import useFightStore, {FIGHT_IN_PROGRESS, FIGHT_LOST, FIGHT_NOT_STARTED, FIGHT_WON, resetFightStore} from './fight.js';


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

  it('finishes a lost fight by deducting gold and resetting state', () => {
    const fighter = {
      spend: vi.fn(),
      train: vi.fn(),
      win: vi.fn(),
    };
    useFightStore.setState({
      bet: 100,
      fighters: [{stats: fighter}],
      messages: [],
      state: FIGHT_LOST,
    });

    useFightStore.getState().finish();

    const fight = useFightStore.getState();
    expect(fighter.spend).toHaveBeenCalledWith(100);
    expect(fighter.win).not.toHaveBeenCalled();
    expect(fighter.train).toHaveBeenCalledWith('skill', 1);
    expect(fight.state).toBe(FIGHT_NOT_STARTED);
  });

  it('does nothing when finish is called while fight is still in progress', () => {
    const fighter = {spend: vi.fn(), train: vi.fn(), win: vi.fn()};
    useFightStore.setState({bet: 250, fighters: [{stats: fighter}], state: FIGHT_IN_PROGRESS});

    useFightStore.getState().finish();

    expect(fighter.win).not.toHaveBeenCalled();
    expect(fighter.spend).not.toHaveBeenCalled();
    expect(fighter.train).not.toHaveBeenCalled();
    expect(useFightStore.getState().state).toBe(FIGHT_IN_PROGRESS);
  });

  it('attack returns empty string when fewer than 2 fighters', () => {
    useFightStore.setState({fighters: [], state: FIGHT_NOT_STARTED});

    const message = useFightStore.getState().attack(0);

    expect(message).toBe('');
  });

  it('player attack hits and returns a hit message', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    useFightStore.setState({
      fighters: [
        {currentAPM: 0, currentHealth: 100, stats: {attack: 100, defense: 1, power: 10}},
        {currentAPM: 0, currentHealth: 100, stats: {attack: 1, defense: 1, power: 1}},
      ],
      state: FIGHT_IN_PROGRESS,
    });

    const message = useFightStore.getState().attack(0);

    expect(message).toContain('You hit \'im for');
    expect(useFightStore.getState().fighters[1].currentHealth).toBeLessThan(100);
  });

  it('player attack misses when defense roll beats attack roll', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(1);
    useFightStore.setState({
      fighters: [
        {currentAPM: 0, currentHealth: 100, stats: {attack: 1, defense: 100, power: 1}},
        {currentAPM: 0, currentHealth: 100, stats: {attack: 1, defense: 100, power: 1}},
      ],
      state: FIGHT_IN_PROGRESS,
    });

    const message = useFightStore.getState().attack(0);

    expect(message).toBe('You missed :(');
  });

  it('enemy attack hits and damages the player', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    useFightStore.setState({
      fighters: [
        {currentAPM: 0, currentHealth: 100, stats: {attack: 1, defense: 1, power: 1}},
        {currentAPM: 0, currentHealth: 100, stats: {attack: 100, defense: 1, power: 10}},
      ],
      state: FIGHT_IN_PROGRESS,
    });

    const message = useFightStore.getState().attack(1);

    expect(message).toContain('He hit you for');
    expect(useFightStore.getState().fighters[0].currentHealth).toBeLessThan(100);
  });

  it('enemy attack misses when defense roll beats attack roll', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(1);
    useFightStore.setState({
      fighters: [
        {currentAPM: 0, currentHealth: 100, stats: {attack: 1, defense: 100, power: 1}},
        {currentAPM: 0, currentHealth: 100, stats: {attack: 1, defense: 100, power: 1}},
      ],
      state: FIGHT_IN_PROGRESS,
    });

    const message = useFightStore.getState().attack(1);

    expect(message).toBe('Je missed :D');
  });

  it('tick returns undefined when fewer than 2 fighters', () => {
    useFightStore.setState({fighters: []});

    const result = useFightStore.getState().tick(100);

    expect(result).toBeUndefined();
  });

  it('tick advances the fight and returns true when a fighter wins', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    useFightStore.setState({
      fighters: [
        {currentAPM: 0, currentHealth: 100, stats: {apm: 60000, attack: 100, defense: 1, power: 1000}},
        {currentAPM: 0, currentHealth: 10, stats: {apm: 1, attack: 1, defense: 1, power: 1}},
      ],
      messages: [],
      state: FIGHT_IN_PROGRESS,
    });

    const result = useFightStore.getState().tick(2);

    const fight = useFightStore.getState();
    expect(result).toBe(true);
    expect(fight.state).toBe(FIGHT_WON);
    expect(fight.messages).toContain('You win!!!!');
  });

  it('tick advances fight state without ending it when attacks miss', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    useFightStore.setState({
      fighters: [
        {currentAPM: 0, currentHealth: 1000, stats: {apm: 60000, attack: 1, defense: 100, power: 1}},
        {currentAPM: 0, currentHealth: 1000, stats: {apm: 1, attack: 1, defense: 100, power: 1}},
      ],
      messages: [],
      state: FIGHT_IN_PROGRESS,
    });

    const result = useFightStore.getState().tick(2);

    const fight = useFightStore.getState();
    expect(result).toBeUndefined();
    expect(fight.state).toBe(FIGHT_IN_PROGRESS);
    expect(fight.messages.length).toBeGreaterThan(0);
  });

  it('tick ends in defeat when enemy delivers fatal damage', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    useFightStore.setState({
      fighters: [
        {currentAPM: 0, currentHealth: 10, stats: {apm: 1, attack: 1, defense: 1, power: 1}},
        {currentAPM: 0, currentHealth: 100, stats: {apm: 120000, attack: 100, defense: 1, power: 1000}},
      ],
      messages: [],
      state: FIGHT_IN_PROGRESS,
    });

    const result = useFightStore.getState().tick(2);

    const fight = useFightStore.getState();
    expect(result).toBe(true);
    expect(fight.state).toBe(FIGHT_LOST);
    expect(fight.messages).toContain('You lost!!!!');
  });
});
