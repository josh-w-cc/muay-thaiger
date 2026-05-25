import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {render, screen} from '@testing-library/react';


describe('UserMenuButton', () => {
  it('renders an edit profile icon button', async () => {
    const {default: UserMenuButton} = await import('./UserMenuButton.js');

    render(<UserMenuButton />);

    const button = screen.getByRole('button', {name: 'Edit Profile'});

    expect(button).toBeInTheDocument();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('pins the button in the top-right corner', () => {
    const directoryPath = path.dirname(fileURLToPath(import.meta.url));
    const modulePath = path.join(directoryPath, 'UserMenuButton.module.css');
    const source = fs.readFileSync(modulePath, 'utf8');

    expect(source).toMatch(/\.userMenuButton\s*{[^}]*position:\s*fixed;/s);
    expect(source).toMatch(/\.userMenuButton\s*{[^}]*right:\s*var\(--space-md\);/s);
    expect(source).toMatch(/\.userMenuButton\s*{[^}]*top:\s*var\(--space-md\);/s);
  });
});
