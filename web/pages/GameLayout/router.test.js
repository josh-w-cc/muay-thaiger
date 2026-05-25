const {gameLayoutComponent, gameLayoutLoader} = vi.hoisted(() => ({
  gameLayoutComponent: vi.fn(),
  gameLayoutLoader: vi.fn(),
}));

vi.mock('./Fallback.js', () => ({
  default: () => <div />,
}));

vi.mock('./index.js', () => ({
  GameLayout: gameLayoutComponent,
  loader: gameLayoutLoader,
}));

describe('GameLayout router', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('defines the grouped child routes for the game layout', async () => {
    const {default: gameLayoutRoute} = await import('./router.js');

    expect(gameLayoutRoute.Component).toBe(gameLayoutComponent);
    expect(gameLayoutRoute.loader).toBe(gameLayoutLoader);
    expect(gameLayoutRoute.children.map(({path}) => path)).toEqual([
      'fight',
      'hub',
      'shop',
      'train',
      '*',
    ]);
  });
});
