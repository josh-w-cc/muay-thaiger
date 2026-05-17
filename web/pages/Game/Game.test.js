import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router';

const originalWebSocket = globalThis.WebSocket;
const originalWindow = globalThis.window;

vi.mock('../../orig/src/menus/CharacterSelect', () => ({
  default: function MockCharacterSelect({onExit}) {
    return <button onClick={onExit}>Character Select</button>;
  },
}));

vi.mock('../../orig/src/menus/Fight', () => ({
  default: function MockFight() {
    return <h2>Fight Screen</h2>;
  },
}));

vi.mock('../../orig/src/menus/Hub.jsx', () => ({
  default: function MockHub({setScreen}) {
    return (
      <>
        <h2>Hub Screen</h2>
        <button onClick={() => setScreen('broken')}>Break Screen</button>
        <button onClick={() => setScreen('character-select')}>Go Character Select</button>
      </>
    );
  },
}));

vi.mock('../../orig/src/menus/Shop', () => ({
  default: function MockShop() {
    return <h2>Shop Screen</h2>;
  },
}));

vi.mock('../../orig/src/menus/Train', () => ({
  default: function MockTrain() {
    return <h2>Train Screen</h2>;
  },
}));

describe('Game', () => {
  beforeEach(() => {
    globalThis.WebSocket = vi.fn(function () {
      return {close: vi.fn(), send: vi.fn()};
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    globalThis.WebSocket = originalWebSocket;
    globalThis.window = originalWindow;
  });

  it('renders the character select screen first', async () => {
    const {default: Game} = await import('./Game.js');
    renderGame({Game});
    expect(screen.getByRole('button', {name: 'Character Select'})).toBeInTheDocument();
  });

  it('connects to the websocket when the game loads', async () => {
    const {default: Game} = await import('./index.js');

    render(<Game />);

    const socketURL = new URL(globalThis.WebSocket.mock.calls[0][0]);

    expect(socketURL.host).toBe(window.location.host);
    expect(socketURL.pathname).toBe('/ws/connect');
    expect(socketURL.protocol).toBe('ws:');
  });

  it('uses the secure websocket protocol on https pages', async () => {
    const secureWindow = Object.create(window);
    Object.defineProperty(secureWindow, 'location', {
      value: new URL('https://example.test/game'),
    });
    globalThis.window = secureWindow;
    const {default: Game} = await import('./index.js');

    render(<Game />);

    const socketURL = new URL(globalThis.WebSocket.mock.calls[0][0]);

    expect(socketURL.protocol).toBe('wss:');
  });

  it('renders each game screen from header controls', async () => {
    const user = userEvent.setup();
    const {default: Game} = await import('./Game.js');

    renderGame({Game});
    await user.click(screen.getByRole('button', {name: 'Character Select'}));

    expect(screen.getByRole('heading', {name: 'Hub Screen'})).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: /fight/i}));
    expect(screen.getByRole('heading', {name: 'Fight Screen'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: /hub/i}));
    expect(screen.getByRole('heading', {name: 'Hub Screen'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: /shop/i}));
    expect(screen.getByRole('heading', {name: 'Shop Screen'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: /train/i}));
    expect(screen.getByRole('heading', {name: 'Train Screen'})).toBeInTheDocument();
  });

  it('renders and recovers from the fallback screen', async () => {
    const user = userEvent.setup();
    const {default: Game} = await import('./Game.js');

    renderGame({Game});
    await user.click(screen.getByRole('button', {name: 'Character Select'}));
    await user.click(screen.getByRole('button', {name: 'Break Screen'}));

    expect(screen.getByRole('heading', {name: 'You broke it!?'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'We have to go back'}));
    expect(screen.getByRole('heading', {name: 'Hub Screen'})).toBeInTheDocument();
  });

  it('renders a game screen from the URL', async () => {
    const {default: Game} = await import('./Game.js');
    renderGame({Game, initialPath: '/fight'});
    expect(screen.getByRole('heading', {name: 'Fight Screen'})).toBeInTheDocument();
  });

  it('routes to root when navigating to character select from a game screen', async () => {
    const user = userEvent.setup();
    const {default: Game} = await import('./Game.js');

    renderGame({Game, initialPath: '/hub'});
    await user.click(screen.getByRole('button', {name: 'Go Character Select'}));
    expect(screen.getByRole('button', {name: 'Character Select'})).toBeInTheDocument();
  });

  it('closes the websocket when the game unmounts', async () => {
    const close = vi.fn();
    globalThis.WebSocket = vi.fn(function () {
      return {close, send: vi.fn()};
    });
    const {default: Game} = await import('./index.js');

    const {unmount} = render(<Game />);
    unmount();

    expect(close).toHaveBeenCalledTimes(1);
  });
});

function renderGame({Game, initialPath = '/'}) {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<Game />} path="/:screen?" />
      </Routes>
    </MemoryRouter>,
  );
}
