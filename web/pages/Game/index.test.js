import {render, screen} from '@testing-library/react';

vi.mock('./Game.js', () => ({
  default: () => <div data-testid="game-app" />,
}));


describe('Game', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the game app', async () => {
    const {default: Game} = await import('./index.js');
    render(<Game />);
    expect(screen.getByTestId('game-app')).toBeInTheDocument();
  });

  it('loader returns null', async () => {
    const {loader} = await import('./index.js');
    expect(loader()).toBeNull();
  });
});
