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

  it('renders gold, rank, and user controls inside the same wrapper above the nav header', async () => {
    const {default: Header} = await import('./Header.js');

    render(<Header />);

    const goldDisplay = screen.getByTestId('gold-display');
    const rankDisplay = screen.getByText('ZZ').parentElement;
    const userMenuButton = screen.getByTestId('user-menu-button');
    const controlsWrapper = goldDisplay.parentElement;

    expect(controlsWrapper).not.toBeNull();
    expect(screen.getByText('Rank')).toBeInTheDocument();
    expect(rankDisplay).not.toBeNull();
    expect(controlsWrapper).toBe(rankDisplay?.parentElement);
    expect(controlsWrapper).toBe(userMenuButton.parentElement);
    expect(screen.getByTestId('nav-header')).toBeInTheDocument();
  });
});
