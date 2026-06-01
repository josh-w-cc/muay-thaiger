import useFightStore, {FIGHT_NOT_STARTED, resetFightStore} from './fight.js';


describe('useFightStore', () => {
  afterEach(() => {
    resetFightStore();
  });

  it('defaults to no active fight', () => {
    const fight = useFightStore.getState();

    expect(fight.id).toBeNull();
    expect(fight.state).toBe(FIGHT_NOT_STARTED);
    expect(fight.messages).toEqual([]);
    expect(fight.fighters).toEqual([]);
  });

  it('replaces fight state with the fight sent by the server', () => {
    useFightStore.setState({
      fighters: [{role: 'attacker'}],
      messages: ['local-message'],
      state: 'in-progress',
    });

    useFightStore.getState().syncServerState({
      details: {round: 1},
      id: 44,
      messages: ['server-message'],
      reason: 'gold',
      state: 'won',
      victory: 9,
    });

    const fight = useFightStore.getState();
    expect(fight.id).toBe(44);
    expect(fight.reason).toBe('gold');
    expect(fight.state).toBe('won');
    expect(fight.messages).toEqual(['server-message']);
    expect(fight.fighters).toEqual([]);
  });

  it('clears fight state when the server sends no fight', () => {
    useFightStore.getState().syncServerState({
      id: 44,
      messages: ['server-message'],
      state: 'won',
    });

    useFightStore.getState().syncServerState(null);

    const fight = useFightStore.getState();
    expect(fight.id).toBeNull();
    expect(fight.state).toBe(FIGHT_NOT_STARTED);
    expect(fight.messages).toEqual([]);
  });
});
