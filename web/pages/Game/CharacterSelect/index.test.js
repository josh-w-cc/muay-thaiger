import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SnowLeopard from './assets/SnowLeopard.png';
import Tiger from './assets/Tiger.png';


let selectMock;

vi.mock('@/actions/selectFighter.js', () => ({
  default: (...args) => selectMock(...args),
}));

describe('CharacterSelect', () => {
  beforeEach(() => {
    selectMock = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders races and selects the chosen race', async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    const raceID = 2;
    const races = [
      {
        id: raceID,
        name: 'Snow Leopard Prime',
        stats: {anima: 8, durability: 7, reach: 6, speed: 9, strength: 5, vitality: 4},
      },
    ];
    const {default: CharacterSelect} = await import('./index.jsx');

    render(<CharacterSelect onExit={onExit} races={races} />);

    const raceHeading = screen.getByRole('heading', {name: 'Snow Leopard Prime'});
    const raceCard = raceHeading.closest('div');

    await user.click(within(raceCard).getByRole('button', {name: 'CHOOSE'}));

    expect(selectMock).toHaveBeenCalledWith(`${raceID}`);
    expect(onExit).toHaveBeenCalledWith(`${raceID}`);
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('renders all races that are provided and maps images by race ID', async () => {
    const {default: CharacterSelect} = await import('./index.jsx');
    const races = [
      {
        id: 2,
        name: 'Snow Leopard Prime',
        stats: {anima: 8, durability: 7, reach: 6, speed: 9, strength: 5, vitality: 4},
      },
      {
        id: 1,
        name: 'Tiger',
        stats: {anima: 1, durability: 1, reach: 1, speed: 1, strength: 1, vitality: 1},
      },
    ];

    render(<CharacterSelect onExit={vi.fn()} races={races} />);

    expect(screen.getByRole('heading', {name: 'Tiger'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Snow Leopard Prime'})).toBeInTheDocument();

    const tigerContainer = screen.getByRole('heading', {name: 'Tiger'}).closest('div');
    const snowLeopardContainer = screen.getByRole('heading', {name: 'Snow Leopard Prime'}).closest('div');

    expect(within(tigerContainer).getByRole('img')).toHaveAttribute('src', expect.stringContaining(Tiger));
    expect(within(snowLeopardContainer).getByRole('img')).toHaveAttribute('src', expect.stringContaining(SnowLeopard));
  });
});
