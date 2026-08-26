describe('moveBatch', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('starts move numbering at zero and increments', async () => {
    const {createMoveNum} = await import('./moveBatch.js');

    expect(createMoveNum()).toBe(0);
    expect(createMoveNum()).toBe(1);
    expect(createMoveNum()).toBe(2);
  });

  it('syncs move numbering from the largest attacker moveList number', async () => {
    const {createMoveNum, syncMoveCount} = await import('./moveBatch.js');

    syncMoveCount({details: {attacker: {moveList: [0, 1, 4]}}});

    expect(createMoveNum()).toBe(5);
  });

  it('does not lower move numbering when moveList is behind current value', async () => {
    const {createMoveNum, syncMoveCount} = await import('./moveBatch.js');

    createMoveNum();
    createMoveNum();
    createMoveNum();
    syncMoveCount({details: {attacker: {moveList: [0, 1]}}});

    expect(createMoveNum()).toBe(3);
  });
});
