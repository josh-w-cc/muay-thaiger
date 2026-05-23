import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SnowLeopard from './assets/SnowLeopard.png';
import Tiger from './assets/Tiger.png';


let selectMock;

vi.mock('@/actions/selectFighter.js', () => ({
  default: (...args) => selectMock(...args),
}));

describe('FighterSelect', () => {
  beforeEach(() => {
    selectMock = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders races and selects the chosen race', async () => {
    const user = userEvent.setup();
    const raceID = 2;
    const races = [
      {
        id: raceID,
        name: 'Snow Leopard Prime',
        stats: {anima: 8, durability: 7, innateStrength: 5, reach: 6, speed: 9, vitality: 4},
      },
    ];
    const {default: FighterSelect} = await import('./index.js');

    render(<FighterSelect races={races} />);

    const raceHeading = screen.getByRole('heading', {name: 'Snow Leopard Prime'});
    const raceCard = raceHeading.closest('div');

    await user.click(within(raceCard).getByRole('button', {name: 'CHOOSE'}));

    expect(selectMock).toHaveBeenCalledWith(`${raceID}`);
  });

  it('renders all races that are provided and maps images by race ID', async () => {
    const {default: FighterSelect} = await import('./index.js');
    const races = [
      {
        id: 2,
        name: 'Snow Leopard Prime',
        stats: {anima: 8, durability: 7, innateStrength: 5, reach: 6, speed: 9, vitality: 4},
      },
      {
        id: 1,
        name: 'Tiger',
        stats: {anima: 1, durability: 1, innateStrength: 1, reach: 1, speed: 1, vitality: 1},
      },
    ];

    render(<FighterSelect races={races} />);

    expect(screen.getByRole('heading', {name: 'Tiger'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Snow Leopard Prime'})).toBeInTheDocument();

    const tigerContainer = screen.getByRole('heading', {name: 'Tiger'}).closest('div');
    const snowLeopardContainer = screen.getByRole('heading', {name: 'Snow Leopard Prime'}).closest('div');

    expect(within(tigerContainer).getByRole('img')).toHaveAttribute('src', expect.stringContaining(Tiger));
    expect(within(snowLeopardContainer).getByRole('img')).toHaveAttribute('src', expect.stringContaining(SnowLeopard));
  });

  it('does not render legacy strength when innateStrength is missing', async () => {
    const {default: FighterSelect} = await import('./index.js');
    const races = [
      {
        id: 1,
        name: 'Tiger',
        stats: {anima: 1, durability: 1, reach: 1, speed: 1, strength: 7, vitality: 1},
      },
    ];

    render(<FighterSelect races={races} />);

    expect(screen.queryByText(/Strength:\s*7/i)).not.toBeInTheDocument();
  });
});
