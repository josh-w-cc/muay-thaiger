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

  it('renders gold, rank, and user controls inside the same wrapper above the header', async () => {
    const {GameLayout} = await import('./GameLayout.js');

    const {container} = render(<GameLayout />);

    const goldDisplay = screen.getByTestId('gold-display');
    const outlet = screen.getByTestId('outlet');
    const rankDisplay = screen.getByText('ZZ').parentElement;
    const userMenuButton = screen.getByTestId('user-menu-button');
    const controlsWrapper = goldDisplay.parentElement;
    const page = outlet.parentElement;

    expect(controlsWrapper).not.toBeNull();
    expect(page).not.toBeNull();
    expect(page?.parentElement).toBe(container.firstChild);
    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(rankDisplay).not.toBeNull();
    expect(controlsWrapper).toBe(rankDisplay?.parentElement);
    expect(controlsWrapper).toBe(userMenuButton.parentElement);
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(outlet).toBeInTheDocument();
  });

  it('matches desktop and mobile control layout styles', () => {
    const directoryPath = path.dirname(fileURLToPath(import.meta.url));
    const modulePath = path.join(directoryPath, 'GameLayout.module.css');
    const source = fs.readFileSync(modulePath, 'utf8');

    expect(source).toMatch(/\.headerLayout\s*{[^}]*margin:\s*0 auto;[^}]*width:\s*fit-content;/s);
    expect(source).toMatch(/\.headerControls\s*{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*1fr auto 1fr;[^}]*width:\s*100%;/s);
    expect(source).toMatch(/\.page\s*{[^}]*padding-top:\s*var\(--space-xl\);/s);
    expect(source).toMatch(/\.headerControls > :first-child\s*{[^}]*justify-self:\s*start;/s);
    expect(source).toMatch(/\.headerControls > :last-child\s*{[^}]*justify-self:\s*end;/s);
    expect(source).toMatch(/\.rankDisplay\s*{[^}]*justify-self:\s*center;/s);
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
