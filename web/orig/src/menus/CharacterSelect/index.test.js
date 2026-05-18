import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';


let selectMock;

vi.mock('../../Fighter.js', () => ({
  default: () => ({select: (...args) => selectMock(...args)}),
}));

describe('CharacterSelect', () => {
  beforeEach(() => {
    selectMock = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders race statics and selects the chosen race', async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    const raceID = 2;
    const raceStatics = [
      {
        id: raceID,
        name: 'Snow Leopard Prime',
        stats: {anima: 8, durability: 7, reach: 6, speed: 9, strength: 5, vitality: 4},
      },
    ];
    const {default: CharacterSelect} = await import('./index.jsx');

    render(<CharacterSelect onExit={onExit} raceStatics={raceStatics} />);

    const raceHeading = screen.getByRole('heading', {name: 'Snow Leopard Prime'});
    const raceCard = raceHeading.closest('div');

    await user.click(within(raceCard).getByRole('button', {name: 'CHOOSE'}));

    expect(selectMock).toHaveBeenCalledWith(`${raceID}`);
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('renders all race statics that are provided', async () => {
    const {default: CharacterSelect} = await import('./index.jsx');
    const raceStatics = [
      {
        id: 1,
        name: 'Tiger',
        stats: {anima: 1, durability: 1, reach: 1, speed: 1, strength: 1, vitality: 1},
      },
      {
        id: 2,
        name: 'Snow Leopard Prime',
        stats: {anima: 8, durability: 7, reach: 6, speed: 9, strength: 5, vitality: 4},
      },
    ];

    render(<CharacterSelect onExit={vi.fn()} raceStatics={raceStatics} />);

    expect(screen.getByRole('heading', {name: 'Tiger'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Snow Leopard Prime'})).toBeInTheDocument();
  });
});
