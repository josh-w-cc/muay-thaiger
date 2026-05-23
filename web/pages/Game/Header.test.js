import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HubButton from './assets/HubButton.png';


const {navigate} = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
}));

describe('Header', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders navigation buttons and uses the colocated hub image', async () => {
    const user = userEvent.setup();
    const {default: Header} = await import('./Header.js');

    render(<Header />);

    expect(screen.getByRole('img', {name: 'Hub'})).toHaveAttribute('src', expect.stringContaining(HubButton));

    await user.click(screen.getByRole('button', {name: 'Fight'}));
    await user.click(screen.getByRole('button', {name: 'Hub'}));
    await user.click(screen.getByRole('button', {name: 'Train'}));
    await user.click(screen.getByRole('button', {name: 'Shop'}));

    expect(navigate).toHaveBeenNthCalledWith(1, '/fight');
    expect(navigate).toHaveBeenNthCalledWith(2, '/hub');
    expect(navigate).toHaveBeenNthCalledWith(3, '/train');
    expect(navigate).toHaveBeenNthCalledWith(4, '/shop');
  });
});
