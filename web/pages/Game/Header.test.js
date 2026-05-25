import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
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

describe('Header', () => {
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
    const {default: Header} = await import('./Header.js');

    render(<Header />);

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

  it('keeps header navigation hover background transparent', () => {
    const directoryPath = path.dirname(fileURLToPath(import.meta.url));
    const modulePath = path.join(directoryPath, 'Header.module.css');
    const source = fs.readFileSync(modulePath, 'utf8');

    expect(source).toMatch(/\.navigationButton:hover\s*{[^}]*background-color:\s*transparent;/s);
  });

  it('defines horizontal mobile header scrolling with snap spacing', () => {
    const directoryPath = path.dirname(fileURLToPath(import.meta.url));
    const modulePath = path.join(directoryPath, 'Header.module.css');
    const mobileHeaderPattern = new RegExp(
      '@media\\(max-width:\\s*768px\\)\\s*{[\\s\\S]*\\.header\\s*{[\\s\\S]*'
      + 'overflow-x:\\s*auto;[\\s\\S]*padding-inline:\\s*var\\(--space-sm\\);[\\s\\S]*'
      + 'right:\\s*var\\(--space-xl\\);[\\s\\S]*'
      + 'scroll-snap-type:\\s*x mandatory;[\\s\\S]*width:\\s*calc\\(100% \\+ var\\(--space-xl\\) \\* 2\\);',
      's',
    );
    const mobileNavigationButtonPattern = new RegExp(
      '@media\\(max-width:\\s*768px\\)\\s*{[\\s\\S]*\\.navigationButton\\s*{[\\s\\S]*'
      + 'flex:\\s*0 0 calc\\(100% - var\\(--space-sm\\) \\* 2\\);[\\s\\S]*scroll-snap-align:\\s*center;',
      's',
    );
    const source = fs.readFileSync(modulePath, 'utf8');

    expect(source).toMatch(mobileHeaderPattern);
    expect(source).toMatch(mobileNavigationButtonPattern);
  });

  it('marks the current route button as active', async () => {
    pathname = '/train';
    const {default: Header} = await import('./Header.js');

    render(<Header />);

    expect(screen.getByRole('button', {name: 'Train'})).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', {name: 'Hub'})).not.toHaveAttribute('aria-current');
  });

  it('scrolls the active route button into view', async () => {
    pathname = '/shop';
    const {default: Header} = await import('./Header.js');

    render(<Header />);

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({block: 'nearest', inline: 'center'});
    });
  });
});
