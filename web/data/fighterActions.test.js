import useFighterActionsStore, {resetFighterActionsStore} from './fighterActions.js';
import useFighterStore, {resetFighterStore} from './fighter.js';


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

  it('stores a created_at timestamp for optimistic fighter actions', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    useFighterActionsStore.getState().addAction({action_id: 2});

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({
        action_id: 2,
        created_at: '2026-01-01T00:00:00.000Z',
      }),
    ]);
  });

  it('removes fighter actions by action id', () => {
    useFighterActionsStore.getState().setActions([
      {action_id: 2, id: 1},
      {action_id: 6, id: 2},
      {action_id: 2, id: 3},
    ]);

    useFighterActionsStore.getState().removeAction(2);

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action_id: 6, id: 2}),
    ]);
  });

  it('ticks action progress sequentially using action durations', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    useFighterActionsStore.getState().setActions([
      {action_id: 2, created_at: '2025-12-31T23:59:58.000Z', id: 1},
      {action_id: 6, created_at: '2025-12-31T23:59:57.000Z', id: 2},
    ]);

    useFighterActionsStore.getState().tick();

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action_id: 2, id: 1, progress: 0}),
      expect.objectContaining({action_id: 6, id: 2, progress: 50}),
    ]);
  });

  it('uses now for invalid action timestamps', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:05.000Z'));
    useFighterActionsStore.getState().setActions([
      {action_id: 2, created_at: '2026-01-01T00:00:00.000Z', id: 1},
      {action_id: 2, created_at: 'not-a-date', id: 2},
    ]);

    useFighterActionsStore.getState().tick();

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action_id: 2, id: 1, progress: 0}),
      expect.objectContaining({action_id: 2, id: 2, progress: 0}),
    ]);
  });

  it('handles elapsed time that spans multiple queued actions', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:05.000Z'));
    useFighterActionsStore.getState().setActions([
      {action_id: 2, created_at: '2026-01-01T00:00:00.000Z', id: 1},
      {action_id: 2, created_at: '2026-01-01T00:00:01.000Z', id: 2},
    ]);

    useFighterActionsStore.getState().tick();

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action_id: 2, id: 1, progress: 0}),
      expect.objectContaining({action_id: 2, id: 2, progress: 0}),
    ]);
  });

  it('prefers touched_at timestamps when calculating progress', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:05.000Z'));
    useFighterActionsStore.getState().setActions([
      {action_id: 2, created_at: '2026-01-01T00:00:00.000Z', id: 1},
      {action_id: 2, created_at: 'not-a-date', id: 2, progress: 25, touched_at: '2026-01-01T00:00:04.000Z'},
    ]);

    useFighterActionsStore.getState().tick();

    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action_id: 2, id: 1, progress: 0}),
      expect.objectContaining({action_id: 2, id: 2, progress: 0}),
    ]);
  });

  it('skips unknown action ids when ticking', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:05.000Z'));
    useFighterStore.setState({stamina: 0, vitality: 3});
    useFighterActionsStore.getState().setActions([
      {action_id: 999, created_at: '2026-01-01T00:00:00.000Z', id: 1},
    ]);

    useFighterActionsStore.getState().tick();

    expect(useFighterStore.getState().stamina).toBe(0);
    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action_id: 999, id: 1, progress: 0}),
    ]);
  });

  it('uses now when scheduled actions are missing timestamps', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:05.000Z'));
    useFighterStore.setState({stamina: 0, vitality: 3});
    useFighterActionsStore.setState({
      actions: [{action_id: 2, id: 1}],
    });

    useFighterActionsStore.getState().tick();

    expect(useFighterStore.getState().stamina).toBe(0);
    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({action_id: 2, id: 1, progress: 0}),
    ]);
  });

  it('trains fighter stats while ticking action progress', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:02.500Z'));
    useFighterStore.setState({
      innateStrength: 1,
      speed: 1,
      stamina: 0,
      vitality: 3,
    });
    useFighterActionsStore.getState().setActions([
      {action_id: 2, created_at: '2026-01-01T00:00:00.000Z', id: 1},
    ]);

    useFighterActionsStore.getState().tick();

    expect(useFighterStore.getState().stamina).toBe(6);
    expect(useFighterActionsStore.getState().actions).toEqual([
      expect.objectContaining({
        action_id: 2,
        id: 1,
        touched_at: '2026-01-01T00:00:02.000Z',
      }),
    ]);

    useFighterActionsStore.getState().tick();

    expect(useFighterStore.getState().stamina).toBe(6);
  });
});
