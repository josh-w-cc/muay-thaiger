const {gameLayoutComponent, gameLayoutLoader} = vi.hoisted(() => ({
  gameLayoutComponent: vi.fn(),
  gameLayoutLoader: vi.fn(),
}));

const {redirect} = vi.hoisted(() => ({
  redirect: vi.fn(),
}));

vi.mock('react-router-dom', () => ({redirect}));

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
    const pathRoutes = gameLayoutRoute.children.filter(({path}) => path);

    expect(gameLayoutRoute.Component).toBe(gameLayoutComponent);
    expect(gameLayoutRoute.loader).toBe(gameLayoutLoader);
    expect(pathRoutes.map(({path}) => path)).toEqual([
      'fight',
      'hub',
      'shop',
      'train',
      '*',
    ]);
  });

  it('redirects to /fight from the index route', async () => {
    const {default: gameLayoutRoute} = await import('./router.js');
    const indexRoute = gameLayoutRoute.children.find(({index}) => index);

    expect(indexRoute).toBeDefined();
    indexRoute.loader();
    expect(redirect).toHaveBeenCalledWith('/fight');
  });
});
