import {render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';


let fetchJSONMock;
let selectMock;

vi.mock('@/utils/fetchAPI.js', () => ({
  fetchJSON: (...args) => fetchJSONMock(...args),
}));

vi.mock('../../Fighter.js', () => ({
  default: () => ({select: (...args) => selectMock(...args)}),
}));

describe('CharacterSelect', () => {
  beforeEach(() => {
    fetchJSONMock = vi.fn();
    selectMock = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads race statics from the API and selects the chosen race', async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();
    const raceID = 2;
    fetchJSONMock.mockResolvedValue([
      {
        id: raceID,
        name: 'Snow Leopard Prime',
        stats: {anima: 8, durability: 7, reach: 6, speed: 9, strength: 5, vitality: 4},
      },
    ]);
    const {default: CharacterSelect} = await import('./index.jsx');

    render(<CharacterSelect onExit={onExit} />);

    expect(fetchJSONMock).toHaveBeenCalledWith('race');
    const raceHeading = await screen.findByRole('heading', {name: 'Snow Leopard Prime'});
    const raceCard = raceHeading.closest('div');

    await user.click(within(raceCard).getByRole('button', {name: 'CHOOSE'}));

    expect(selectMock).toHaveBeenCalledWith(`${raceID}`);
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('keeps fallback statics when the API responds with an empty array', async () => {
    const onExit = vi.fn();
    fetchJSONMock.mockResolvedValue([]);
    const {default: CharacterSelect} = await import('./index.jsx');

    render(<CharacterSelect onExit={onExit} />);

    await waitFor(() => expect(fetchJSONMock).toHaveBeenCalledWith('race'));
    expect(screen.getByRole('heading', {name: 'Tiger'})).toBeInTheDocument();
  });

  it('keeps fallback statics when the API request fails', async () => {
    const onExit = vi.fn();
    fetchJSONMock.mockRejectedValue(new Error('network failure'));
    const {default: CharacterSelect} = await import('./index.jsx');

    render(<CharacterSelect onExit={onExit} />);

    await waitFor(() => expect(fetchJSONMock).toHaveBeenCalledWith('race'));
    expect(screen.getByRole('heading', {name: 'Tiger'})).toBeInTheDocument();
  });

  it('does not update state after unmount when the API responds late', async () => {
    const onExit = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const {promise, resolve} = getDeferredPromise();
    fetchJSONMock.mockReturnValue(promise);
    const {default: CharacterSelect} = await import('./index.jsx');

    const {unmount} = render(<CharacterSelect onExit={onExit} />);
    await waitFor(() => expect(fetchJSONMock).toHaveBeenCalledWith('race'));
    unmount();
    resolve([
      {
        id: 1,
        name: 'Tiger',
        stats: {anima: 1, durability: 1, reach: 2, speed: 1, strength: 2, vitality: 2},
      },
    ]);
    await Promise.resolve();

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

function getDeferredPromise() {
  let resolve;
  const promise = new Promise((nextResolve) => {
    resolve = nextResolve;
  });
  return {promise, resolve};
}
