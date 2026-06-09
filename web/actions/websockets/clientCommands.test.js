const {connectSocketOnAppLoad, respondToAuth, routeToHubIfAuthorized, sendCommand} = vi.hoisted(() => ({
  connectSocketOnAppLoad: vi.fn(),
  respondToAuth: vi.fn(),
  routeToHubIfAuthorized: vi.fn(),
  sendCommand: vi.fn(),
}));

vi.mock('@/actions/websockets/auth.js', () => ({
  respondToAuth,
  routeToHubIfAuthorized,
}));

vi.mock('@/actions/websockets/index.js', () => ({
  connectSocketOnAppLoad,
  sendCommand,
}));

describe('client websocket commands', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.useRealTimers();
  });

  it('sends an idle command', async () => {
    const {createFighterActionCmd} = await import('./clientCommands.js');

    createFighterActionCmd(2);

    expect(sendCommand).toHaveBeenCalledWith({action_id: 2, cmd: 'idle'});
  });

  it('sends a stop command', async () => {
    const {removeFighterActionCmd} = await import('./clientCommands.js');

    removeFighterActionCmd(2);

    expect(sendCommand).toHaveBeenCalledWith({action_id: 2, cmd: 'stop'});
  });

  it('sends a move command as a batched move list payload', async () => {
    const {moveCmd} = await import('./clientCommands.js');

    moveCmd(3);

    expect(sendCommand).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(sendCommand).toHaveBeenCalledWith({cmd: 'move', moves: [{move_id: 3, move_num: 0}]});
  });

  it('updates the active fight move lastUsed slightly in the future before the batch is sent', async () => {
    const {moveCmd} = await import('./clientCommands.js');
    const {default: useFightStore} = await import('@/data/fight.js');
    vi.setSystemTime(12_345);
    useFightStore.getState().syncServerState({
      details: {
        attacker: {
          moves: [{id: 3, lastUsed: 100}, {id: 4, lastUsed: 200}],
          startingStats: {},
          stats: {},
        },
      },
      id: 44,
      reason: 'gold',
    });

    moveCmd(3);

    expect(useFightStore.getState().details.attacker.moves).toEqual([{id: 3, lastUsed: 12_595}, {id: 4, lastUsed: 200}]);
    expect(sendCommand).not.toHaveBeenCalled();
  });

  it('anchors local lastUsed to the next expected batch sync when one is already pending', async () => {
    const {moveCmd} = await import('./clientCommands.js');
    const {default: useFightStore} = await import('@/data/fight.js');
    vi.setSystemTime(20_000);
    useFightStore.getState().syncServerState({
      details: {
        attacker: {
          moves: [{id: 3, lastUsed: 100}, {id: 4, lastUsed: 200}],
          startingStats: {},
          stats: {},
        },
      },
      id: 44,
      reason: 'gold',
    });

    moveCmd(3);
    vi.setSystemTime(20_300);
    moveCmd(4);

    expect(useFightStore.getState().details.attacker.moves).toEqual([{id: 3, lastUsed: 20_250}, {id: 4, lastUsed: 20_500}]);
    expect(sendCommand).not.toHaveBeenCalled();
  });

  it('batches repeated clicks for the same move as separate move entries', async () => {
    const {moveCmd} = await import('./clientCommands.js');

    moveCmd(3);
    moveCmd(3);
    moveCmd(3);

    vi.advanceTimersByTime(500);

    expect(sendCommand).toHaveBeenCalledTimes(1);
    expect(sendCommand).toHaveBeenCalledWith({
      cmd: 'move',
      moves: [{move_id: 3, move_num: 0}, {move_id: 3, move_num: 1}, {move_id: 3, move_num: 2}],
    });
  });

  it('batches clicks for multiple moves in the same flush window with increasing move numbers', async () => {
    const {moveCmd} = await import('./clientCommands.js');

    moveCmd(2);
    moveCmd(3);
    moveCmd(2);

    vi.advanceTimersByTime(500);

    expect(sendCommand).toHaveBeenCalledTimes(1);
    expect(sendCommand).toHaveBeenCalledWith({
      cmd: 'move',
      moves: [{move_id: 2, move_num: 0}, {move_id: 3, move_num: 1}, {move_id: 2, move_num: 2}],
    });
  });

  it('logs and skips move command when move id is invalid', async () => {
    const {moveCmd} = await import('./clientCommands.js');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      moveCmd('3');

      expect(consoleError).toHaveBeenCalledWith('Invalid move:3');
      expect(sendCommand).not.toHaveBeenCalled();
    }
    finally {
      consoleError.mockRestore();
    }
  });

  it('sends a fight command with reason and rank', async () => {
    const {createFightCmd} = await import('./clientCommands.js');

    createFightCmd(' gold ');

    expect(sendCommand).toHaveBeenCalledWith({cmd: 'fight', rank: '', reason: 'gold'});
  });

  it('throws for invalid fight reasons', async () => {
    const {createFightCmd} = await import('./clientCommands.js');

    expect(() => createFightCmd('tournament')).toThrowError('invalid-fight-reason');

    expect(sendCommand).not.toHaveBeenCalled();
  });

  it('responds to pending auth and routes to the hub for fighter selection', async () => {
    const {selectFighterCmd} = await import('./clientCommands.js');
    const socket = {};
    connectSocketOnAppLoad.mockReturnValue(socket);

    selectFighterCmd();

    expect(respondToAuth).toHaveBeenCalledWith(socket);
    expect(routeToHubIfAuthorized).toHaveBeenCalledTimes(1);
  });
});
