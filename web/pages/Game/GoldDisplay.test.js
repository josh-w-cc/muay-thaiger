import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {render, screen} from '@testing-library/react';


const fighter = vi.hoisted(() => ({gold: 0}));

vi.mock('@/data/fighter.js', () => ({
  default: () => fighter,
}));

describe('GoldDisplay', () => {
  afterEach(() => {
    vi.clearAllMocks();
    fighter.gold = 0;
  });

  it('renders the baht symbol', async () => {
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('฿')).toBeInTheDocument();
  });

  it('shows zero when fighter has no gold', async () => {
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('displays gold divided by 100', async () => {
    fighter.gold = 500;
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('floors fractional gold values', async () => {
    fighter.gold = 199;
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('formats large gold amounts using exponential notation', async () => {
    fighter.gold = 10000000;
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('1.00e+5')).toBeInTheDocument();
  });

  it('aligns baht display to the desktop header edge and keeps mobile spacing', () => {
    const directoryPath = path.dirname(fileURLToPath(import.meta.url));
    const modulePath = path.join(directoryPath, 'GoldDisplay.module.css');
    const source = fs.readFileSync(modulePath, 'utf8');

    expect(source).toMatch(/\.goldDisplay\s*{[\s\S]*left:\s*var\(--space-xl\);/s);
    expect(source).toMatch(/@media\(max-width:\s*768px\)\s*{[\s\S]*\.goldDisplay\s*{[\s\S]*left:\s*var\(--space-md\);/s);
  });
});
