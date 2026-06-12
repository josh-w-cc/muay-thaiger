import useFightStore, {resetFightStore} from './fight/index.js';


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
          startingStats: {health: '300', stamina: 200},
          stats: {attack: '1111111', defense: 2222222, health: '240', stamina: 150},
        },
        defender: {
          startingStats: {health: 260, stamina: '210'},
          stats: {attack: '3333333', defense: 4444444, health: '200', stamina: 180},
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
    expect(details.attacker.stats.attack).toBe(1111111n);
    expect(details.attacker.stats.defense).toBe(2222222n);
    expect(details.defender.startingStats.health).toBe(260n);
    expect(details.defender.startingStats.stamina).toBe(210n);
    expect(details.defender.stats.health).toBe(200n);
    expect(details.defender.stats.stamina).toBe(180n);
    expect(details.defender.stats.attack).toBe(3333333n);
    expect(details.defender.stats.defense).toBe(4444444n);
  });

  it('updates attacker move lastUsed locally when a move is used on the client', () => {
    useFightStore.getState().syncServerState({
      details: {
        attacker: {
          moves: [{id: 1, lastUsed: 100}, {id: 2, lastUsed: 200}],
          startingStats: {},
          stats: {},
        },
      },
      id: 44,
      reason: 'gold',
    });

    useFightStore.getState().markMoveUsed(2, 9_999);

    expect(useFightStore.getState().details.attacker.moves).toEqual([{id: 1, lastUsed: 100}, {id: 2, lastUsed: 10_499}]);
  });

  it('keeps newer local move lastUsed when a stale server update arrives for the same fight', () => {
    useFightStore.getState().syncServerState({
      details: {
        attacker: {
          moves: [{id: 1, lastUsed: 100}, {id: 2, lastUsed: 200}],
          startingStats: {},
          stats: {},
        },
      },
      id: 44,
      reason: 'gold',
    });
    useFightStore.getState().markMoveUsed(2, 9_999);

    useFightStore.getState().syncServerState({
      details: {
        attacker: {
          moves: [{id: 1, lastUsed: 120}, {id: 2, lastUsed: 300}],
          startingStats: {},
          stats: {},
        },
      },
      id: 44,
      reason: 'gold',
    });

    expect(useFightStore.getState().details.attacker.moves).toEqual([{id: 1, lastUsed: 120}, {id: 2, lastUsed: 10_499}]);
  });

  it('starts with an empty pending feed', () => {
    expect(useFightStore.getState().pendingFeed).toEqual([]);
  });

  it('adds a pending feed item with attacker name from fighter details when a move is used', () => {
    useFightStore.getState().syncServerState({
      details: {
        attacker: {
          name: 'Thaiger',
          startingStats: {},
          stats: {},
        },
      },
      id: 44,
      reason: 'gold',
    });

    useFightStore.getState().addPendingFeedItem('Cross');

    expect(useFightStore.getState().pendingFeed).toEqual([
      {attacker: 'Thaiger', isSelf: true, move: 'Cross'},
    ]);
  });

  it('appends multiple pending feed items in click order', () => {
    useFightStore.getState().syncServerState({
      details: {
        attacker: {
          name: 'Snowball',
          startingStats: {},
          stats: {},
        },
      },
      id: 44,
      reason: 'gold',
    });

    useFightStore.getState().addPendingFeedItem('Jab');
    useFightStore.getState().addPendingFeedItem('Knee');

    expect(useFightStore.getState().pendingFeed).toEqual([
      {attacker: 'Snowball', isSelf: true, move: 'Jab'},
      {attacker: 'Snowball', isSelf: true, move: 'Knee'},
    ]);
  });

  it('does not add a pending feed item when attacker data is missing', () => {
    useFightStore.getState().addPendingFeedItem('Cross');

    expect(useFightStore.getState().pendingFeed).toEqual([]);
  });

  it('clears pending feed when the server syncs new state', () => {
    useFightStore.getState().syncServerState({
      details: {
        attacker: {
          name: 'Thaiger',
          startingStats: {},
          stats: {},
        },
      },
      id: 44,
      reason: 'gold',
    });
    useFightStore.getState().addPendingFeedItem('Cross');
    expect(useFightStore.getState().pendingFeed).toHaveLength(1);

    useFightStore.getState().syncServerState({
      details: {
        attacker: {
          name: 'Thaiger',
          startingStats: {},
          stats: {},
        },
      },
      id: 44,
      reason: 'gold',
    });

    expect(useFightStore.getState().pendingFeed).toEqual([]);
  });
});
