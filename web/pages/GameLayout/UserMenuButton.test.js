import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';


const {navigate} = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
}));

vi.mock('react-icons/fa6', () => ({
  FaCircleUser: (props) => <svg data-testid="user-menu-icon" {...props} />,
}));

describe('UserMenuButton', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders an edit profile icon button that routes to edit user', async () => {
    const user = userEvent.setup();
    const {default: UserMenuButton} = await import('./UserMenuButton.js');

    render(<UserMenuButton />);

    const button = screen.getByRole('button', {name: 'Edit Profile'});

    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('user-menu-icon')).toBeInTheDocument();
    await user.click(button);
    expect(navigate).toHaveBeenCalledWith('/edit-user');
  });
});
