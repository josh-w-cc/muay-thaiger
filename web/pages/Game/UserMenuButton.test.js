import {render, screen} from '@testing-library/react';


vi.mock('react-icons/fa6', () => ({
  FaCircleUser: (props) => <svg data-testid="user-menu-icon" {...props} />,
}));

describe('UserMenuButton', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders an edit profile icon button', async () => {
    const {default: UserMenuButton} = await import('./UserMenuButton.js');

    render(<UserMenuButton />);

    const button = screen.getByRole('button', {name: 'Edit Profile'});

    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('user-menu-icon')).toBeInTheDocument();
  });
});
