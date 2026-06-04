const createBrowserRouter = vi.fn((routes) => routes);

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
  fighterSelectLoader: vi.fn(),
  default: () => <div />,
}));

vi.mock('./pages/GameLayout/router.js', () => ({
  default: {
    children: [
      {path: 'fight'},
      {path: 'hub'},
      {path: 'shop'},
      {path: 'train'},
      {path: '*'},
    ],
  },
}));

describe('router', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uses explicit game routes for each screen', async () => {
    const {default: routes} = await import('./router.js');
    const children = routes[0].children;
    const indexRoute = children.find((route) => route.index);
    const editUserRoute = children.find((route) => route.path === 'edit-user');
    const gameLayoutRoute = children.find((route) => route.children);

    const serverDownRoute = children.find((route) => route.path === 'server-down');

    expect(indexRoute.index).toBe(true);
    expect(indexRoute.element).toBeDefined();
    expect(indexRoute.loader).toEqual(expect.any(Function));
    expect(editUserRoute.path).toBe('edit-user');
    expect(editUserRoute.lazy).toEqual(expect.any(Function));
    expect(serverDownRoute.path).toBe('server-down');
    expect(serverDownRoute.lazy).toEqual(expect.any(Function));
    expect(gameLayoutRoute.children.map(({path}) => path)).toEqual([
      'fight',
      'hub',
      'shop',
      'train',
      '*',
    ]);
  });
});
