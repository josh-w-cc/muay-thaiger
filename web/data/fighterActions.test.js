import useFighterActionsStore, {resetFighterActionsStore} from './fighter/fighterActions.js';
import useFighterStore, {resetFighterStore} from './fighter/index.js';


describe('useFighterActionsStore', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    resetFighterActionsStore();
    resetFighterStore();
  });

  it('stores fighter actions list', () => {
    const actions = [{id: 2}, {id: 3}];

    useFighterActionsStore.getState().setActions(actions);

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({id: 2, progress: 0}),
      expect.objectContaining({id: 3, progress: 0}),
    ]);
  });

  it('appends a fighter action', () => {
    useFighterActionsStore.getState().setActions([{id: 2}]);
    const action = {id: 3};

    useFighterActionsStore.getState().addAction(action);

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({id: 2}),
      expect.objectContaining(action),
    ]);
  });

  it('keeps oldest action active while appending a fighter action', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    useFighterActionsStore.getState().setActions([
      {action: 2, created_at: '2025-12-31T23:59:58.000Z', id: 1},
      {action: 6, created_at: '2025-12-31T23:59:57.000Z', id: 2},
    ]);
    useFighterActionsStore.getState().tick();

    useFighterActionsStore.getState().addAction({action: 2, id: 3});

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 2, id: 1, progress: 0}),
      expect.objectContaining({action: 6, id: 2, progress: 0}),
      expect.objectContaining({action: 2, id: 3, progress: 0}),
    ]);
  });

  it('continues the oldest queued action after appending a new fighter action', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:05.000Z'));
    useFighterActionsStore.getState().setActions([
      {action: 2, created_at: '2026-01-01T00:00:04.500Z', id: 2},
      {action: 2, created_at: '2026-01-01T00:00:04.000Z', id: 1},
    ]);

    useFighterActionsStore.getState().addAction({action: 2, id: 3});
    vi.setSystemTime(new Date('2026-01-01T00:00:05.500Z'));
    useFighterActionsStore.getState().tick();

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 2, id: 2, progress: 0}),
      expect.objectContaining({action: 2, id: 1, progress: 50}),
      expect.objectContaining({action: 2, id: 3, progress: 0}),
    ]);
  });

  it('stores a created_at timestamp for optimistic fighter actions', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    useFighterActionsStore.getState().addAction({action: 2});

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({
        action: 2,
        created_at: '2026-01-01T00:00:00.000Z',
      }),
    ]);
  });

  it('removes fighter actions by action id', () => {
    useFighterActionsStore.getState().setActions([
      {action: 2, id: 1},
      {action: 6, id: 2},
      {action: 2, id: 3},
    ]);

    useFighterActionsStore.getState().removeAction(2);

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 6, id: 2}),
    ]);
  });

  it('transfers touched_at to next remaining action when removing the action with the latest touched_at', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.500Z'));
    useFighterActionsStore.getState().setActions([
      {action: 2, id: 1, touched_at: '3026-01-01T00:00:00.111Z'},
      {action: 6, id: 2, touched_at: '3026-01-01T00:00:00.005Z'},
    ]);

    useFighterActionsStore.getState().removeAction(2);

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 6, id: 2, touched_at: '3026-01-01T00:00:00.111Z'}),
    ]);
  });

  it('does not change touched_at when removed action does not have the latest touched_at', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:01.500Z'));
    useFighterActionsStore.getState().setActions([
      {action: 2, id: 1, touched_at: '2026-01-01T00:00:00.005Z'},
      {action: 6, id: 2, touched_at: '2026-01-01T00:00:00.111Z'},
    ]);

    useFighterActionsStore.getState().removeAction(2);

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 6, id: 2, touched_at: '2026-01-01T00:00:00.111Z'}),
    ]);
  });

  it('returns empty list when removing all remaining actions', () => {
    useFighterActionsStore.getState().setActions([
      {action: 2, id: 1, touched_at: '2026-01-01T00:00:00.111Z'},
    ]);

    useFighterActionsStore.getState().removeAction(2);

    expect(useFighterActionsStore.getState().actions).toEqual([]);
  });

  it('transfers touched_at to the first remaining action with a valid timestamp when initial action has none', () => {
    useFighterActionsStore.getState().setActions([
      {action: 6, id: 2},
      {action: 6, id: 3, touched_at: '2026-01-01T00:00:00.005Z'},
      {action: 2, id: 1, touched_at: '2026-01-01T00:00:00.111Z'},
    ]);

    useFighterActionsStore.getState().removeAction(2);

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 6, id: 2}),
      expect.objectContaining({action: 6, id: 3, touched_at: '2026-01-01T00:00:00.111Z'}),
    ]);
  });

  it('skips remaining actions with no touched_at when selecting transfer target', () => {
    useFighterActionsStore.getState().setActions([
      {action: 6, id: 2, touched_at: '2026-01-01T00:00:00.005Z'},
      {action: 6, id: 3},
      {action: 2, id: 1, touched_at: '2026-01-01T00:00:00.111Z'},
    ]);

    useFighterActionsStore.getState().removeAction(2);

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 6, id: 2, touched_at: '2026-01-01T00:00:00.111Z'}),
      expect.objectContaining({action: 6, id: 3}),
    ]);
  });

  it('transfers touched_at to the action with the highest remaining touched_at among multiple candidates', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.500Z'));
    useFighterActionsStore.getState().setActions([
      {action: 6, id: 2, touched_at: '3026-01-01T00:00:00.050Z'},
      {action: 6, id: 3, touched_at: '3026-01-01T00:00:00.005Z'},
      {action: 2, id: 1, touched_at: '3026-01-01T00:00:00.111Z'},
    ]);

    useFighterActionsStore.getState().removeAction(2);

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 6, id: 2, touched_at: '3026-01-01T00:00:00.111Z'}),
      expect.objectContaining({action: 6, id: 3, touched_at: '3026-01-01T00:00:00.005Z'}),
    ]);
  });

  it('resets remaining touched_at values when removing the active action', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.500Z'));
    useFighterActionsStore.getState().setActions([
      {action: 2, id: 1, touched_at: '2026-01-01T00:00:00.000Z'},
      {action: 6, id: 2, touched_at: '2026-01-01T00:00:00.100Z'},
      {action: 4, id: 3, touched_at: '2026-01-01T00:00:00.200Z'},
    ]);

    useFighterActionsStore.getState().removeAction(2);

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 6, id: 2, touched_at: '2026-01-01T00:00:00.500Z'}),
      expect.objectContaining({action: 4, id: 3, touched_at: '2026-01-01T00:00:00.500Z'}),
    ]);
  });

  it('ticks action progress sequentially using action durations', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    useFighterActionsStore.getState().setActions([
      {action: 2, created_at: '2025-12-31T23:59:58.000Z', id: 1},
      {action: 6, created_at: '2025-12-31T23:59:57.000Z', id: 2},
    ]);

    useFighterActionsStore.getState().tick();

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 2, id: 1, progress: 0}),
      expect.objectContaining({action: 6, id: 2, progress: 50}),
    ]);
  });

  it('uses now for invalid action timestamps', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:05.000Z'));
    useFighterActionsStore.getState().setActions([
      {action: 2, created_at: '2026-01-01T00:00:00.000Z', id: 1},
      {action: 2, created_at: 'not-a-date', id: 2},
    ]);

    useFighterActionsStore.getState().tick();

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 2, id: 1, progress: 0}),
      expect.objectContaining({action: 2, id: 2, progress: 0}),
    ]);
  });

  it('handles elapsed time that spans multiple queued actions', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:05.000Z'));
    useFighterActionsStore.getState().setActions([
      {action: 2, created_at: '2026-01-01T00:00:00.000Z', id: 1},
      {action: 2, created_at: '2026-01-01T00:00:01.000Z', id: 2},
    ]);

    useFighterActionsStore.getState().tick();

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 2, id: 1, progress: 0}),
      expect.objectContaining({action: 2, id: 2, progress: 0}),
    ]);
  });

  it('prefers touched_at timestamps when calculating progress', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:05.000Z'));
    useFighterActionsStore.getState().setActions([
      {action: 2, created_at: '2026-01-01T00:00:00.000Z', id: 1},
      {action: 2, created_at: 'not-a-date', id: 2, progress: 25, touched_at: '2026-01-01T00:00:04.000Z'},
    ]);

    useFighterActionsStore.getState().tick();

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 2, id: 1, progress: 0}),
      expect.objectContaining({action: 2, id: 2, progress: 0}),
    ]);
  });

  it('skips unknown action ids when ticking', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:05.000Z'));
    useFighterStore.setState({stamina: 0n, vitality: 3n});
    useFighterActionsStore.getState().setActions([
      {action: 999, created_at: '2026-01-01T00:00:00.000Z', id: 1},
    ]);

    useFighterActionsStore.getState().tick();

    expect(useFighterStore.getState().stamina).toBe(0n);
    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 999, id: 1, progress: 0}),
    ]);
  });

  it('uses now when scheduled actions are missing timestamps', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:05.000Z'));
    useFighterStore.setState({stamina: 0n, vitality: 3n});
    useFighterActionsStore.setState({
      actions: [{action: 2, id: 1}],
    });

    useFighterActionsStore.getState().tick();

    expect(useFighterStore.getState().stamina).toBe(0n);
    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action: 2, id: 1, progress: 0}),
    ]);
  });

  it('trains fighter stats while ticking action progress', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:02.500Z'));
    useFighterStore.setState({
      vigor: 1n,
      speed: 1n,
      stamina: 0n,
      vitality: 3n,
    });
    useFighterActionsStore.getState().setActions([
      {action: 2, created_at: '2026-01-01T00:00:00.000Z', id: 1},
    ]);

    useFighterActionsStore.getState().tick();

    expect(useFighterStore.getState().stamina).toBe(6n);
    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({
        action: 2,
        id: 1,
        touched_at: '2026-01-01T00:00:02.000Z',
      }),
    ]);

    useFighterActionsStore.getState().tick();

    expect(useFighterStore.getState().stamina).toBe(6n);
  });
});
