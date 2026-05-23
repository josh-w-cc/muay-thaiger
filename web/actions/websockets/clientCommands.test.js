const {addAction, isSocketReady, respondToAuth, routeToHubIfAuthorized} = vi.hoisted(() => ({
  addAction: vi.fn(),
  isSocketReady: vi.fn(),
  respondToAuth: vi.fn(),
  routeToHubIfAuthorized: vi.fn(),
}));

vi.mock('@/data/fighterActions.js', () => ({
  default: {
    getState: () => ({addAction}),
  },
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

  it('sends an idle command and optimistically stores the action', async () => {
    isSocketReady.mockReturnValue(true);
    const {createFighterActionCmd} = await import('./clientCommands.js');
    const send = vi.fn();
    const socket = {send};

    createFighterActionCmd(socket, 2);

    expect(addAction).toHaveBeenCalledWith({action_id: 2});
    expect(send).toHaveBeenCalledWith(JSON.stringify({action_id: 2, cmd: 'idle'}));
  });

  it('does not send an idle command for invalid action identifiers or unavailable sockets', async () => {
    isSocketReady.mockReturnValue(false);
    const {createFighterActionCmd} = await import('./clientCommands.js');
    const send = vi.fn();
    const socket = {send};

    createFighterActionCmd(socket, 2);
    createFighterActionCmd(socket, '2');

    expect(addAction).not.toHaveBeenCalled();
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
