import {render, screen} from '@testing-library/react';


const {loadPlayerToken, redirect} = vi.hoisted(() => ({
  loadPlayerToken: vi.fn(),
  redirect: vi.fn(() => 'redirected'),
}));
const {loadMoves} = vi.hoisted(() => ({
  loadMoves: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet" />,
  redirect,
}));

vi.mock('@/actions/websockets/state/token.js', () => ({
  loadPlayerToken,
}));
vi.mock('@/data/movesLoader.js', () => ({
  default: (...args) => loadMoves(...args),
}));

vi.mock('./Header.js', () => ({
  default: () => <div data-testid="header" />,
}));

describe('GameLayout', () => {
  afterEach(() => {
    vi.clearAllMocks();
    loadMoves.mockResolvedValue([]);
  });

  it('renders the header above the route outlet inside the shared page wrapper', async () => {
    const {GameLayout} = await import('./index.js');

    render(<GameLayout />);

    const header = screen.getByTestId('header');
    const outlet = screen.getByTestId('outlet');

    expect(header).toBeInTheDocument();
    expect(outlet).toBeInTheDocument();
    expect(outlet.parentElement).not.toBeNull();
    expect(header.nextElementSibling).toBe(outlet.parentElement);
  });

  it('redirects to root when no player token exists', async () => {
    loadPlayerToken.mockReturnValue(false);
    const {loader} = await import('./index.js');

    const result = await loader();

    expect(loadPlayerToken).toHaveBeenCalledTimes(1);
    expect(loadMoves).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith('/');
    expect(result).toBe('redirected');
  });

  it('returns null when a player token exists', async () => {
    loadPlayerToken.mockReturnValue(true);
    loadMoves.mockResolvedValue([{id: 1, name: 'Wild Punch'}]);
    const {loader} = await import('./index.js');

    const result = await loader();

    expect(loadPlayerToken).toHaveBeenCalledTimes(1);
    expect(redirect).not.toHaveBeenCalled();
    expect(loadMoves).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });
});
