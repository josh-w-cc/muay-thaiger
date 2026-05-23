import {render, screen} from '@testing-library/react';


const fighter = vi.hoisted(() => ({
  gold: 2100,
}));

vi.mock('@/data/fighter.js', () => ({
  default: () => fighter,
}));

vi.mock('./Header.js', () => ({
  default: function MockHeader() {
    return <div>Header</div>;
  },
}));

describe('GameLayout', () => {
  afterEach(() => {
    fighter.gold = 2100;
    vi.clearAllMocks();
  });

  it('renders baht above the header', async () => {
    const {GameLayout} = await import('./GameLayout.js');

    render(<GameLayout />);

    const baht = screen.getByText('฿ 21');
    const header = screen.getByText('Header');

    expect(baht).toBeInTheDocument();
    expect(header).toBeInTheDocument();
    expect(baht.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders baht with fractional values when needed', async () => {
    fighter.gold = 2155;
    const {GameLayout} = await import('./GameLayout.js');

    render(<GameLayout />);

    expect(screen.getByText('฿ 21.55')).toBeInTheDocument();
  });
});
