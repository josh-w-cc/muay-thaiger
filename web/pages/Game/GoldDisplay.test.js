import {render, screen} from '@testing-library/react';


const fighter = vi.hoisted(() => ({gold: 0n}));

vi.mock('@/data/fighter.js', () => ({
  default: () => fighter,
}));

describe('GoldDisplay', () => {
  afterEach(() => {
    vi.clearAllMocks();
    fighter.gold = 0n;
  });

  it('renders the baht symbol', async () => {
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('฿')).toBeInTheDocument();
  });

  it('shows zero with cents when fighter has no gold', async () => {
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('displays gold as baht with cents', async () => {
    fighter.gold = 500n;
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('5.00')).toBeInTheDocument();
  });

  it('shows fractional baht values with cents', async () => {
    fighter.gold = 199n;
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('1.99')).toBeInTheDocument();
  });

  it('hides cents when baht has at least five digits', async () => {
    fighter.gold = 1000099n;
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('10000')).toBeInTheDocument();
  });

  it('formats large gold amounts using exponential notation', async () => {
    fighter.gold = 10000000n;
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('1.00e5')).toBeInTheDocument();
  });

  it('formats large gold values that arrived as strings', async () => {
    fighter.gold = '12345678901234567890';
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('1.23e17')).toBeInTheDocument();
  });
});
