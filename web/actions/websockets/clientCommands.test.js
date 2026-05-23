const {isSocketReady, respondToAuth, routeToHubIfAuthorized} = vi.hoisted(() => ({
  isSocketReady: vi.fn(),
  respondToAuth: vi.fn(),
  routeToHubIfAuthorized: vi.fn(),
}));

vi.mock('@/actions/websockets/auth.js', () => ({
  respondToAuth,
  routeToHubIfAuthorized,
}));

vi.mock('@/actions/websockets/websocketState.js', () => ({
  isSocketReady,
}));

describe('client websocket commands', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('sends an idle command', async () => {
    isSocketReady.mockReturnValue(true);
    const {createFighterActionCmd} = await import('./clientCommands.js');
    const send = vi.fn();
    const socket = {send};

    createFighterActionCmd(socket, 2);

    expect(send).toHaveBeenCalledWith(JSON.stringify({action_id: 2, cmd: 'idle'}));
  });

  it('does not send an idle command when the socket is unavailable', async () => {
    isSocketReady.mockReturnValue(false);
    const {createFighterActionCmd} = await import('./clientCommands.js');
    const send = vi.fn();
    const socket = {send};

    createFighterActionCmd(socket, 2);

    expect(send).not.toHaveBeenCalled();
  });

  it('sends a stop command', async () => {
    isSocketReady.mockReturnValue(true);
    const {removeFighterActionCmd} = await import('./clientCommands.js');
    const send = vi.fn();
    const socket = {send};

    removeFighterActionCmd(socket, 2);

    expect(send).toHaveBeenCalledWith(JSON.stringify({action_id: 2, cmd: 'stop'}));
  });

  it('does not send a stop command when the socket is unavailable', async () => {
    isSocketReady.mockReturnValue(false);
    const {removeFighterActionCmd} = await import('./clientCommands.js');
    const send = vi.fn();
    const socket = {send};

    removeFighterActionCmd(socket, 2);

    expect(send).not.toHaveBeenCalled();
  });

  it('responds to pending auth and routes to the hub for fighter selection', async () => {
    const {selectFighterCmd} = await import('./clientCommands.js');
    const socket = {};

    selectFighterCmd(socket);

    expect(respondToAuth).toHaveBeenCalledWith(socket);
    expect(routeToHubIfAuthorized).toHaveBeenCalledTimes(1);
  });
});
