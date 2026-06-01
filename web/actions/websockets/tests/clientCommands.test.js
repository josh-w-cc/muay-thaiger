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
    const {createFighterActionCmd} = await import('../clientCommands.js');

    createFighterActionCmd(2);

    expect(sendCommand).toHaveBeenCalledWith({action_id: 2, cmd: 'idle'});
  });

  it('sends a stop command', async () => {
    const {removeFighterActionCmd} = await import('../clientCommands.js');

    removeFighterActionCmd(2);

    expect(sendCommand).toHaveBeenCalledWith({action_id: 2, cmd: 'stop'});
  });

  it('sends a fight command with reason and rank', async () => {
    const {createFightCmd} = await import('../clientCommands.js');

    createFightCmd('gold');

    expect(sendCommand).toHaveBeenCalledWith({cmd: 'fight', rank: '', reason: 'gold'});
  });

  it('responds to pending auth and routes to the hub for fighter selection', async () => {
    const {selectFighterCmd} = await import('../clientCommands.js');
    const socket = {};
    connectSocketOnAppLoad.mockReturnValue(socket);

    selectFighterCmd();

    expect(respondToAuth).toHaveBeenCalledWith(socket);
    expect(routeToHubIfAuthorized).toHaveBeenCalledTimes(1);
  });
});
