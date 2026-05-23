import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HubButton from './assets/HubButton.png';
import ShopButton from './assets/ShopButton.png';
import TrainButton from './assets/TrainButton.png';


const {navigate} = vi.hoisted(() => ({
  navigate: vi.fn(),
}));
let pathname = '/hub';

vi.mock('react-router-dom', () => ({
  useLocation: () => ({pathname}),
  useNavigate: () => navigate,
}));

describe('Header', () => {
  afterEach(() => {
    vi.clearAllMocks();
    pathname = '/hub';
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
  it('marks the current route button as active', async () => {
    pathname = '/train';
    const {default: Header} = await import('./Header.js');

    render(<Header />);

    expect(screen.getByRole('button', {name: 'Train'})).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', {name: 'Hub'})).not.toHaveAttribute('aria-current');
  });
});
