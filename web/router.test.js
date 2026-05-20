const createBrowserRouter = vi.fn((routes) => routes);
const characterSelectLoader = vi.fn();
const Game = () => <div />;

vi.mock('react-router-dom', () => ({
  createBrowserRouter,
}));

vi.mock('./pages/NotFound.js', () => ({
  default: () => <div />,
}));

vi.mock('./pages/RootLayout/index.js', () => ({
  default: () => <div />,
}));

vi.mock('./pages/Game/index.js', () => ({
  characterSelectLoader,
  default: Game,
}));

describe('router', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uses explicit game routes for each screen', async () => {
    const {default: routes} = await import('./router.js');
    const children = routes[0].children;
    const indexRoute = children.find((route) => route.index);
    const gameLayoutRoute = children.find((route) => route.children);

    expect(indexRoute.index).toBe(true);
    expect(indexRoute.loader).toBe(characterSelectLoader);
    expect(indexRoute.element.type).toBe(Game);
    expect(gameLayoutRoute.children.map(({path}) => path)).toEqual([
      'fight',
      'hub',
      'shop',
      'train',
      '*',
    ]);
  });
});
