import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';


const {loadPlayerToken, navigate, redirect} = vi.hoisted(() => ({
  loadPlayerToken: vi.fn(),
  navigate: vi.fn(),
  redirect: vi.fn(() => 'redirected'),
}));

vi.mock('react-router-dom', () => ({
  redirect,
  useNavigate: () => navigate,
}));

vi.mock('@/actions/websockets/state/token.js', () => ({
  loadPlayerToken,
}));

describe('EditUser', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows a placeholder message and returns to hub', async () => {
    const user = userEvent.setup();
    const {default: EditUser} = await import('./index.js');

    render(<EditUser />);

    expect(screen.getByRole('heading', {name: 'Check back later'})).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Return to Hub'}));
    expect(navigate).toHaveBeenCalledWith('/hub');
  });

  it('loader redirects to fighter select when token is missing', async () => {
    loadPlayerToken.mockReturnValue(null);
    const {loader} = await import('./index.js');

    expect(await loader()).toBe('redirected');
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('loader allows the page when token exists', async () => {
    loadPlayerToken.mockReturnValue('token-value');
    const {loader} = await import('./index.js');

    await expect(loader()).resolves.toBeNull();
    expect(redirect).not.toHaveBeenCalled();
  });
});
