import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HubButton from './assets/HubButton.png';
import ShopButton from './assets/ShopButton.png';
import TrainButton from './assets/TrainButton.png';


const {navigate, scrollIntoView} = vi.hoisted(() => ({
  navigate: vi.fn(),
  scrollIntoView: vi.fn(),
}));
let pathname = '/hub';
const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;

vi.mock('react-router-dom', () => ({
  useLocation: () => ({pathname}),
  useNavigate: () => navigate,
}));

describe('NavHeader', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    pathname = '/hub';
  });

  afterAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: originalScrollIntoView,
      writable: true,
    });
  });

  it('renders navigation buttons and uses colocated game images', async () => {
    const user = userEvent.setup();
    const {default: NavHeader} = await import('./NavHeader.js');

    render(<NavHeader />);

    expect(screen.getByRole('img', {name: 'Hub'})).toHaveAttribute('src', expect.stringContaining(HubButton));
    expect(screen.getByRole('img', {name: 'Shop'})).toHaveAttribute('src', expect.stringContaining(ShopButton));
    expect(screen.getByRole('img', {name: 'Train'})).toHaveAttribute('src', expect.stringContaining(TrainButton));
    expect(screen.getByRole('button', {name: 'Hub'})).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', {name: 'Fight'})).not.toHaveAttribute('aria-current');

    await user.click(screen.getByRole('button', {name: 'Fight'}));
    await user.click(screen.getByRole('button', {name: 'Hub'}));
    await user.click(screen.getByRole('button', {name: 'Train'}));
    await user.click(screen.getByRole('button', {name: 'Shop'}));

    expect(navigate).toHaveBeenNthCalledWith(1, '/fight');
    expect(navigate).toHaveBeenNthCalledWith(2, '/hub');
    expect(navigate).toHaveBeenNthCalledWith(3, '/train');
    expect(navigate).toHaveBeenNthCalledWith(4, '/shop');
  });

  it('marks the current route button as active', async () => {
    pathname = '/train';
    const {default: NavHeader} = await import('./NavHeader.js');

    render(<NavHeader />);

    expect(screen.getByRole('button', {name: 'Train'})).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', {name: 'Hub'})).not.toHaveAttribute('aria-current');
  });

  it('scrolls the active route button into view', async () => {
    pathname = '/shop';
    const {default: NavHeader} = await import('./NavHeader.js');

    render(<NavHeader />);

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({block: 'nearest', inline: 'center'});
    });
  });
});
