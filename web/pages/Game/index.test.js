import {render, screen} from '@testing-library/react';

describe('Game', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the game app', async () => {
    const {default: Game} = await import('./index.js');
    render(<Game />);
    expect(screen.getByRole('heading', {name: 'Choose your fighter:'})).toBeInTheDocument();
  });

  it('loader returns null', async () => {
    const {loader} = await import('./index.js');
    expect(loader()).toBeNull();
  });
});
