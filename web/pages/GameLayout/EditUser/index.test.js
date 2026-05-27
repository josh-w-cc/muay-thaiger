import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';


const {navigate} = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
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
});
