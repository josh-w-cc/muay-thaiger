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

  it('uses index and screen routes for game pages', async () => {
    const {default: routes} = await import('./router.js');
    const indexRoute = routes[0].children.find((route) => route.index === true);
    const screenRoute = routes[0].children.find((route) => route.path === ':screen');
    expect(indexRoute).toBeDefined();
    expect(screenRoute).toBeDefined();
  });
});
