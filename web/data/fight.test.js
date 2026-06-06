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
      details: {
        attacker: {
          calculatedStats: {},
          startingStats: {},
          stats: {},
        },
        round: 1,
      },
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
      details: {
        attacker: {
          calculatedStats: {},
          startingStats: {},
          stats: {},
        },
      },
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

  it('parses fight participant stats into BigInts from server payloads', () => {
    useFightStore.getState().syncServerState({
      details: {
        attacker: {
          calculatedStats: {attack: '1111111', defense: 2222222},
          startingStats: {health: '300', stamina: 200},
          stats: {health: '240', stamina: 150},
        },
        defender: {
          calculatedStats: {attack: '3333333', defense: 4444444},
          startingStats: {health: 260, stamina: '210'},
          stats: {health: '200', stamina: 180},
        },
      },
      id: 44,
      reason: 'gold',
    });

    const {details} = useFightStore.getState();

    expect(details.attacker.startingStats.health).toBe(300n);
    expect(details.attacker.startingStats.stamina).toBe(200n);
    expect(details.attacker.stats.health).toBe(240n);
    expect(details.attacker.stats.stamina).toBe(150n);
    expect(details.attacker.calculatedStats.attack).toBe(1111111n);
    expect(details.attacker.calculatedStats.defense).toBe(2222222n);
    expect(details.defender.startingStats.health).toBe(260n);
    expect(details.defender.startingStats.stamina).toBe(210n);
    expect(details.defender.stats.health).toBe(200n);
    expect(details.defender.stats.stamina).toBe(180n);
    expect(details.defender.calculatedStats.attack).toBe(3333333n);
    expect(details.defender.calculatedStats.defense).toBe(4444444n);
  });
});
