import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {render, screen} from '@testing-library/react';


vi.mock('./GoldDisplay.js', () => ({
  default: () => <div data-testid="gold-display" />,
}));

vi.mock('./NavHeader.js', () => ({
  default: () => <div data-testid="nav-header" />,
}));

vi.mock('./UserMenuButton.js', () => ({
  default: () => <button data-testid="user-menu-button" type="button">Edit Profile</button>,
}));

describe('Header', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders gold and user controls inside the same wrapper above the nav header', async () => {
    const {default: Header} = await import('./Header.js');

    render(<Header />);

    const goldDisplay = screen.getByTestId('gold-display');
    const userMenuButton = screen.getByTestId('user-menu-button');
    const controlsWrapper = goldDisplay.parentElement;

    expect(controlsWrapper).not.toBeNull();
    expect(controlsWrapper).toBe(userMenuButton.parentElement);
    expect(screen.getByTestId('nav-header')).toBeInTheDocument();
  });

  it('matches desktop and mobile control layout styles', () => {
    const directoryPath = path.dirname(fileURLToPath(import.meta.url));
    const modulePath = path.join(directoryPath, 'Header.module.css');
    const source = fs.readFileSync(modulePath, 'utf8');

    expect(source).toMatch(/\.headerLayout\s*{[^}]*margin:\s*0 auto;[^}]*width:\s*fit-content;/s);
    expect(source).toMatch(
      /\.headerControls\s*{[^}]*justify-content:\s*space-between;[^}]*padding:\s*0 var\(--space-md\);[^}]*width:\s*100%;/s,
    );
    expect(source).toMatch(
      /@media\(max-width:\s*768px\)\s*{[\s\S]*\.headerControls\s*{[\s\S]*position:\s*fixed;[\s\S]*top:\s*0;[\s\S]*width:\s*100vw;[\s\S]*}/s,
    );
  });
});
