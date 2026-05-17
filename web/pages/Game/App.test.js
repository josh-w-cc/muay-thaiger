import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const originalWebSocket = globalThis.WebSocket;

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

vi.mock('../../orig/src/menus/Header.jsx', () => ({
  default: function MockHeader({setScreen}) {
    return (
      <>
        <button onClick={() => setScreen('hub')}>Go Hub</button>
        <button onClick={() => setScreen('fight')}>Go Fight</button>
        <button onClick={() => setScreen('shop')}>Go Shop</button>
        <button onClick={() => setScreen('train')}>Go Train</button>
      </>
    );
  },
}));

vi.mock('../../orig/src/menus/Hub.jsx', () => ({
  default: function MockHub({setScreen}) {
    return (
      <>
        <h2>Hub Screen</h2>
        <button onClick={() => setScreen('broken')}>Break Screen</button>
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

describe('Game App', () => {
  beforeEach(() => {
    globalThis.WebSocket = vi.fn(function () {
      return {close: vi.fn(), send: vi.fn()};
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    globalThis.WebSocket = originalWebSocket;
  });

  it('renders the character select screen first', async () => {
    const {default: App} = await import('./App.js');
    render(<App />);
    expect(screen.getByRole('button', {name: 'Character Select'})).toBeInTheDocument();
  });

  it('connects to the websocket when the app loads', async () => {
    const {default: App} = await import('./App.js');

    render(<App />);

    const socketURL = new URL(globalThis.WebSocket.mock.calls[0][0]);

    expect(socketURL.host).toBe(window.location.host);
    expect(socketURL.pathname).toBe('/api/connect');
    expect(socketURL.protocol).toBe('ws:');
  });

  it('renders each game screen from header controls', async () => {
    const user = userEvent.setup();
    const {default: App} = await import('./App.js');

    render(<App />);
    await user.click(screen.getByRole('button', {name: 'Character Select'}));

    expect(screen.getByRole('heading', {name: 'Hub Screen'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Go Fight'}));
    expect(screen.getByRole('heading', {name: 'Fight Screen'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Go Shop'}));
    expect(screen.getByRole('heading', {name: 'Shop Screen'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Go Train'}));
    expect(screen.getByRole('heading', {name: 'Train Screen'})).toBeInTheDocument();
  });

  it('renders and recovers from the fallback screen', async () => {
    const user = userEvent.setup();
    const {default: App} = await import('./App.js');

    render(<App />);
    await user.click(screen.getByRole('button', {name: 'Character Select'}));
    await user.click(screen.getByRole('button', {name: 'Break Screen'}));

    expect(screen.getByRole('heading', {name: 'You broke it!?'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'We have to go back'}));
    expect(screen.getByRole('heading', {name: 'Hub Screen'})).toBeInTheDocument();
  });

  it('closes the websocket when the app unmounts', async () => {
    const close = vi.fn();
    globalThis.WebSocket = vi.fn(function () {
      return {close, send: vi.fn()};
    });
    const {default: App} = await import('./App.js');

    const {unmount} = render(<App />);
    unmount();

    expect(close).toHaveBeenCalledTimes(1);
  });
});
