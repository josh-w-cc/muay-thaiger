const connectSocketOnAppLoad = vi.fn();
const render = vi.fn();
const createRoot = vi.fn(() => ({render}));


vi.mock('react-dom/client', () => ({
  createRoot,
}));

vi.mock('react-router-dom', () => ({
  RouterProvider: () => <div>router</div>,
}));

vi.mock('./data/websocket.js', () => ({
  connectSocketOnAppLoad,
}));

vi.mock('./router.js', () => ({
  default: {},
}));

describe('main', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('connects websocket on app load', async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await import('./main.js');

    expect(connectSocketOnAppLoad).toHaveBeenCalledTimes(1);
    expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
    expect(render).toHaveBeenCalledTimes(1);
  });
});
