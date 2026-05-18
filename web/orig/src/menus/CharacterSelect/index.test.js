import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';


const fetchJSON = vi.fn();
const select = vi.fn();

vi.mock('@/utils/fetchAPI.js', () => ({
  fetchJSON,
}));

vi.mock('../../Fighter.js', () => ({
  default: () => ({select}),
}));

describe('CharacterSelect', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads race statics from the API and selects the chosen race', async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    fetchJSON.mockResolvedValue([
      {
        id: 2,
        name: 'Snow Leopard Prime',
        stats: {anima: 8, durability: 7, reach: 6, speed: 9, strength: 5, vitality: 4},
      },
    ]);
    const {default: CharacterSelect} = await import('./index.jsx');

    render(<CharacterSelect onExit={onExit} />);

    expect(fetchJSON).toHaveBeenCalledWith('race');
    const raceHeading = await screen.findByRole('heading', {name: 'Snow Leopard Prime'});
    const raceCard = raceHeading.closest('div');

    await user.click(within(raceCard).getByRole('button', {name: 'CHOOSE'}));

    expect(select).toHaveBeenCalledWith('2');
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
