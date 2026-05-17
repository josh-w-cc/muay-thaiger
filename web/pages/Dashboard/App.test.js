import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';


vi.mock('../../orig/src/menus/CharacterSelect', () => ({
  default: function CharacterSelect({onExit}) {
    return <button onClick={onExit}>Character Select</button>;
  },
}));

vi.mock('../../orig/src/menus/Fight', () => ({
  default: function Fight() {
    return <h2>Fight Screen</h2>;
  },
}));

vi.mock('../../orig/src/menus/Header.jsx', () => ({
  default: function Header({setScreen}) {
    return (
      <>
        <button onClick={() => setScreen('hub')}>Go Hub</button>
        <button onClick={() => setScreen('fight')}>Go Fight</button>
        <button onClick={() => setScreen('shop')}>Go Shop</button>
        <button onClick={() => setScreen('train')}>Go Train</button>
        <button onClick={() => setScreen('broken')}>Go Broken</button>
      </>
    );
  },
}));

vi.mock('../../orig/src/menus/Hub.jsx', () => ({
  default: function Hub() {
    return <h2>Hub Screen</h2>;
  },
}));

vi.mock('../../orig/src/menus/Shop', () => ({
  default: function Shop() {
    return <h2>Shop Screen</h2>;
  },
}));

vi.mock('../../orig/src/menus/Train', () => ({
  default: function Train() {
    return <h2>Train Screen</h2>;
  },
}));


describe('Dashboard App', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the character select screen first', async () => {
    const {default: App} = await import('./App.js');
    render(<App />);
    expect(screen.getByRole('button', {name: 'Character Select'})).toBeInTheDocument();
  });

  it('renders each dashboard screen from header controls', async () => {
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
    await user.click(screen.getByRole('button', {name: 'Go Broken'}));

    expect(screen.getByRole('heading', {name: 'You broke it!?'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'We have to go back'}));
    expect(screen.getByRole('heading', {name: 'Hub Screen'})).toBeInTheDocument();
  });
});
