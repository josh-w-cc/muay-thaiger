import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {render, screen} from '@testing-library/react';


const {loadPlayerToken, redirect} = vi.hoisted(() => ({
  loadPlayerToken: vi.fn(),
  redirect: vi.fn(() => 'redirected'),
}));

vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet" />,
  redirect,
}));

vi.mock('@/actions/websockets/token.js', () => ({
  loadPlayerToken,
}));

vi.mock('./GoldDisplay.js', () => ({
  default: () => <div data-testid="gold-display" />,
}));

vi.mock('./Header.js', () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock('./UserMenuButton.js', () => ({
  default: () => <button data-testid="user-menu-button" type="button">Edit Profile</button>,
}));

describe('GameLayout', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders gold and user controls inside the same wrapper above the header', async () => {
    const {GameLayout} = await import('./GameLayout.js');

    render(<GameLayout />);

    const goldDisplay = screen.getByTestId('gold-display');
    const userMenuButton = screen.getByTestId('user-menu-button');
    const controlsWrapper = goldDisplay.parentElement;

    expect(controlsWrapper).not.toBeNull();
    expect(controlsWrapper).toBe(userMenuButton.parentElement);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('matches desktop and mobile control layout styles', () => {
    const directoryPath = path.dirname(fileURLToPath(import.meta.url));
    const modulePath = path.join(directoryPath, 'GameLayout.module.css');
    const source = fs.readFileSync(modulePath, 'utf8');

    expect(source).toMatch(/\.headerLayout\s*{[^}]*margin:\s*0 auto;[^}]*width:\s*fit-content;/s);
    expect(source).toMatch(/\.headerControls\s*{[^}]*justify-content:\s*space-between;[^}]*width:\s*100%;/s);
    expect(source).toMatch(/@media\(max-width:\s*768px\)\s*{[\s\S]*\.headerControls\s*{[\s\S]*position:\s*fixed;[\s\S]*}/s);
  });

  it('redirects to root when no player token exists', async () => {
    loadPlayerToken.mockReturnValue(false);
    const {loader} = await import('./GameLayout.js');

    const result = await loader();

    expect(loadPlayerToken).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith('/');
    expect(result).toBe('redirected');
  });

  it('returns null when a player token exists', async () => {
    loadPlayerToken.mockReturnValue(true);
    const {loader} = await import('./GameLayout.js');

    const result = await loader();

    expect(loadPlayerToken).toHaveBeenCalledTimes(1);
    expect(redirect).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
