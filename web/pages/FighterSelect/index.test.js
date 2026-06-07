import {act, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useRacesStore, {resetRacesStore} from '@/data/races.js';
import SnowLeopard from './assets/SnowLeopard.png';
import Tiger from './assets/Tiger.png';


let selectMock;

function resetRaces() {
  act(() => {
    resetRacesStore();
  });
}

vi.mock('@/actions/selectFighter.js', () => ({
  default: (...args) => selectMock(...args),
}));

describe('FighterSelect', () => {
  beforeEach(() => {
    selectMock = vi.fn();
    resetRaces();
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetRaces();
  });

  it('renders races and selects the chosen race', async () => {
    const user = userEvent.setup();
    const raceID = 2;
    const races = [
      {
        id: raceID,
        name: 'Snow Leopard Prime',
        stats: {anima: 8, durability: 7, reach: 6, speed: 9, vigor: 5, vitality: 4},
      },
    ];
    const {default: FighterSelect} = await import('./index.js');

    act(() => {
      useRacesStore.getState().setRaces(races);
    });
    render(<FighterSelect />);

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
        stats: {anima: 8, durability: 7, reach: 6, speed: 9, vigor: 5, vitality: 4},
      },
      {
        id: 1,
        name: 'Tiger',
        stats: {anima: 1, durability: 1, reach: 1, speed: 1, vigor: 1, vitality: 1},
      },
    ];

    act(() => {
      useRacesStore.getState().setRaces(races);
    });
    render(<FighterSelect />);

    const pageHeading = screen.getByRole('heading', {name: 'Choose your fighter:'});
    const racesContainer = pageHeading.nextElementSibling;

    expect(screen.getByRole('heading', {name: 'Tiger'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Snow Leopard Prime'})).toBeInTheDocument();
    expect(racesContainer).toContainElement(screen.getByRole('heading', {name: 'Tiger'}));
    expect(racesContainer).toContainElement(screen.getByRole('heading', {name: 'Snow Leopard Prime'}));

    const tigerContainer = screen.getByRole('heading', {name: 'Tiger'}).closest('div');
    const snowLeopardContainer = screen.getByRole('heading', {name: 'Snow Leopard Prime'}).closest('div');

    expect(within(tigerContainer).getByRole('img')).toHaveAttribute('src', expect.stringContaining(Tiger));
    expect(within(snowLeopardContainer).getByRole('img')).toHaveAttribute('src', expect.stringContaining(SnowLeopard));
  });

  it('does not render legacy strength when vigor is missing', async () => {
    const {default: FighterSelect} = await import('./index.js');
    const races = [
      {
        id: 1,
        name: 'Tiger',
        stats: {anima: 1, durability: 1, reach: 1, speed: 1, strength: 7, vigor: 0, vitality: 1},
      },
    ];

    act(() => {
      useRacesStore.getState().setRaces(races);
    });
    render(<FighterSelect />);

    expect(screen.queryByText(/Vigor:\s*7/i)).not.toBeInTheDocument();
  });
});
