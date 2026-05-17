describe('TickerState', () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('registers its tick interval during construction', async () => {
    vi.useFakeTimers();
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');

    const {TickerState} = await import('./Ticker.js');

    expect(setIntervalSpy).toHaveBeenCalledWith(TickerState.tick, 10);
  });

  it('returns early when there are no listeners', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

    const {TickerState} = await import('./Ticker.js');

    TickerState.tick();

    expect(TickerState.actions).toEqual([]);
    expect(TickerState.lastAction).toBe(Date.parse('2024-01-01T00:00:00.000Z'));
  });

  it('skips listeners when time has not advanced', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

    const {TickerState} = await import('./Ticker.js');
    const action = vi.fn();

    TickerState.addListener(action);
    TickerState.tick();

    expect(action).not.toHaveBeenCalled();
    expect(TickerState.lastAction).toBe(Date.parse('2024-01-01T00:00:00.000Z'));
  });

  it('notifies listeners with the elapsed time when time advances', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

    const {TickerState} = await import('./Ticker.js');
    const action = vi.fn();

    TickerState.addListener(action);
    vi.setSystemTime(new Date('2024-01-01T00:00:00.025Z'));
    TickerState.tick();

    expect(action).toHaveBeenCalledWith(25);
    expect(TickerState.lastAction).toBe(Date.parse('2024-01-01T00:00:00.025Z'));
  });
});
