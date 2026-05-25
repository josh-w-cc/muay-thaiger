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

    expect(screen.getByText('1.00e5')).toBeInTheDocument();
  });
});
