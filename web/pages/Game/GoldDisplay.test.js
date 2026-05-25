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

  it('shows zero with cents when fighter has no gold', async () => {
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('displays gold as baht with cents', async () => {
    fighter.gold = 500;
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('5.00')).toBeInTheDocument();
  });

  it('shows fractional baht values with cents', async () => {
    fighter.gold = 199;
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('1.99')).toBeInTheDocument();
  });

  it('hides cents when baht has at least five digits', async () => {
    fighter.gold = 1000099;
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('10000')).toBeInTheDocument();
  });

  it('formats large gold amounts using exponential notation', async () => {
    fighter.gold = 10000000;
    const {default: GoldDisplay} = await import('./GoldDisplay.js');

    render(<GoldDisplay />);

    expect(screen.getByText('1.00e5')).toBeInTheDocument();
  });
});
