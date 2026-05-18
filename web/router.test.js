const createBrowserRouter = vi.fn((routes) => routes);

vi.mock('react-router', () => ({
  createBrowserRouter,
}));

vi.mock('./pages/NotFound.js', () => ({
  default: () => <div />,
}));

vi.mock('./pages/RootLayout/index.js', () => ({
  default: () => <div />,
}));

describe('router', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uses an optional screen segment route for game pages', async () => {
    const {default: routes} = await import('./router.js');
    const gameRoute = routes[0].children.find((route) => route.lazy);
    expect(gameRoute.path).toBe('/:screen?');
  });
});
