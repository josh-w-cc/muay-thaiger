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
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
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

  it('sends a move command', async () => {
    const {moveCmd} = await import('./clientCommands.js');

    moveCmd(3);

    expect(sendCommand).toHaveBeenCalledWith({cmd: 'move', move_id: 3});
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
