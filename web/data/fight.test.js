import useFightStore, {resetFightStore} from './fight.js';


describe('useFightStore', () => {
  afterEach(() => {
    resetFightStore();
  });

  it('defaults to no active fight', () => {
    const fight = useFightStore.getState();

    expect(fight.id).toBeNull();
    expect(fight.reason).toBeNull();
    expect(fight.victory).toBeNull();
    expect(fight).not.toHaveProperty('fighters');
    expect(fight).not.toHaveProperty('messages');
    expect(fight).not.toHaveProperty('state');
  });

  it('replaces fight state with the fight sent by the server', () => {
    useFightStore.setState({
      messages: ['local-message'],
      state: 'in-progress',
    });

    useFightStore.getState().syncServerState({
      created_at: '2026-06-01T00:00:00.000Z',
      details: {round: 1},
      id: 44,
      rank: 'bronze',
      reason: 'gold',
      updated_at: '2026-06-01T01:00:00.000Z',
      victory: 9,
    });

    const fight = useFightStore.getState();
    expect(fight.id).toBe(44);
    expect(fight.created_at).toBe('2026-06-01T00:00:00.000Z');
    expect(fight.rank).toBe('bronze');
    expect(fight.reason).toBe('gold');
    expect(fight.updated_at).toBe('2026-06-01T01:00:00.000Z');
    expect(fight).not.toHaveProperty('messages');
    expect(fight).not.toHaveProperty('state');
  });

  it('clears fight state when the server sends no fight', () => {
    useFightStore.getState().syncServerState({
      id: 44,
      reason: 'gold',
      victory: 9,
    });

    useFightStore.getState().syncServerState(null);

    const fight = useFightStore.getState();
    expect(fight.id).toBeNull();
    expect(fight.reason).toBeNull();
    expect(fight.victory).toBeNull();
    expect(fight).not.toHaveProperty('messages');
    expect(fight).not.toHaveProperty('state');
  });
});
