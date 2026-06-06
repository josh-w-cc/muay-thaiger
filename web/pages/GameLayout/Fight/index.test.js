import 'shared/bigInt.js';

import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useMovesStore, {resetMovesStore} from '@/data/moves.js';

import sectionCss from '@/components/primitive/Section.module.css';
import SnowLeopardMuayThaiReady from './assets/SnowLeopardMuayThaiReady.png';
import TigerMuayThai from './assets/TigerMuayThai.png';
import Fight from './index.js';


const {fighter, fightState, createFightCmd, moveCmd, needsZerothFight} = vi.hoisted(() => ({
  createFightCmd: vi.fn(),
  fighter: {gold: 500, id: 1, stamina: 1, strength: 1},
  fightState: {},
  moveCmd: vi.fn(),
  needsZerothFight: vi.fn(),
}));

vi.mock('@/data/fighter.js', () => ({
  default: () => fighter,
}));

vi.mock('@/data/fight.js', () => ({
  default: () => fightState,
}));

vi.mock('@/actions/websockets/clientCommands.js', () => ({
  createFightCmd,
  moveCmd,
}));

vi.mock('./ZerothFight.js', () => ({
  default: function MockZerothFight() {
    return <div>Zeroth Fight</div>;
  },
  needsZerothFight: (...args) => needsZerothFight(...args),
}));

describe('Fight', () => {
  beforeEach(() => {
    resetMovesStore();
    useMovesStore.getState().setMoves([
      {id: 1, name: 'Jab', recovery: 3},
      {id: 2, name: 'Cross', recovery: 4},
    ]);
    needsZerothFight.mockReturnValue(false);
    Object.assign(fightState, {
      id: null,
      reason: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders ZerothFight when needed', () => {
    needsZerothFight.mockReturnValue(true);
    render(<Fight />);

    expect(screen.getByText('Zeroth Fight')).toBeInTheDocument();
  });

  it('wraps fight content in a section', () => {
    const {container} = render(<Fight />);
    const sections = container.querySelectorAll('section');
    const fightSection = sections[0];
    const glorySection = sections[1];

    expect(fightSection).toBeInTheDocument();
    expect(within(fightSection).getByRole('heading', {name: 'Fight for ฿'})).toBeInTheDocument();
    expect(fightSection).not.toHaveTextContent('Fight for Glory');

    expect(glorySection).toBeInTheDocument();
    expect(glorySection).toHaveClass(sectionCss.section);
    expect(within(glorySection).getByRole('heading', {name: 'Fight for Glory'})).toBeInTheDocument();
    expect(within(glorySection).queryByRole('button', {name: /Strategy:/})).not.toBeInTheDocument();
    expect(within(glorySection).queryAllByRole('progressbar')).toHaveLength(0);
  });

  it('sends a fight command when clicking Fight', async () => {
    const user = userEvent.setup();
    render(<Fight />);

    await user.click(screen.getByRole('button', {name: 'Fight!'}));

    expect(createFightCmd).toHaveBeenCalledWith('gold');
  });

  it('shows active fight details from the server fight payload', () => {
    Object.assign(fightState, {
      created_at: '2026-06-01T00:00:00.000Z',
      details: {
        attacker: {
          moves: [{id: 1, lastUsed: 123}, {id: 2, lastUsed: 456}],
          race: 1,
          startingStats: {health: 300n, stamina: 200n},
          stats: {attack: 1111111n, defense: 2222222n, health: 240n, stamina: 150n},
        },
        defender: {
          race: 2,
          startingStats: {health: 260n, stamina: 210n},
          stats: {attack: 3333333n, defense: 4444444n, health: 200n, stamina: 180n},
        },
        feed: [{attacker: 'Tiger', isSelf: true, move: 'Jab', result: 'Lands for 10!'}],
        strategy: 'Server Strategy',
      },
      id: 19,
      reason: 'gold',
    });
    render(<Fight />);
    expect(document.body).toHaveTextContent('Fight pending...');
    expect(document.body).toHaveTextContent('Fight ID: 19');
    expect(document.body).toHaveTextContent('Reason: gold');
    expect(document.body).toHaveTextContent('Created: 2026-06-01T00:00:00.000Z');
    const detailsPre = document.body.querySelector('pre');
    expect(detailsPre).toBeInTheDocument();
    expect(detailsPre.textContent).toBe(JSON.stringify(fightState.details, null, 2));
    const fightSection = screen.getByText('Fight pending...').closest('section');
    expect(fightSection).toBeInTheDocument();
    expect(within(fightSection).getByRole('button', {name: 'Strategy: Server Strategy'})).toBeInTheDocument();
    expect(within(fightSection).getByRole('button', {name: 'Jab'})).toBeInTheDocument();
    expect(within(fightSection).getByRole('img', {name: 'Tiger Muay Thai fighter'}))
      .toHaveAttribute('src', expect.stringContaining(TigerMuayThai));
    expect(within(fightSection).getByRole('img', {name: 'Snow leopard Muay Thai fighter'}))
      .toHaveAttribute('src', expect.stringContaining(SnowLeopardMuayThaiReady));
    expect(within(fightSection).getByRole('progressbar', {name: 'Tiger fighter stamina'})).toHaveAttribute('aria-valuenow', '150');
    expect(within(fightSection).getByRole('progressbar', {name: 'Tiger fighter health'})).toHaveAttribute('aria-valuenow', '240');
    expect(within(fightSection).getByRole('progressbar', {name: 'Snow leopard fighter health'})).toHaveAttribute('aria-valuenow', '200');
    expect(fightSection).toHaveTextContent('A: 1.11e6');
    expect(fightSection).toHaveTextContent('D: 2.22e6');
    expect(fightSection).toHaveTextContent('A: 3.33e6');
    expect(fightSection).toHaveTextContent('D: 4.44e6');
    expect(fightSection).toHaveTextContent('Tiger throws Jab — Lands for 10!');
    const glorySection = screen.getByRole('heading', {name: 'Fight for Glory'}).closest('section');
    expect(within(glorySection).queryByRole('button', {name: /Strategy:/})).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Fight!'})).not.toBeInTheDocument();
  });

  it('omits details metadata when pending fight has no details payload', () => {
    Object.assign(fightState, {
      created_at: '2026-06-01T00:00:00.000Z',
      details: null,
      id: 20,
      reason: 'gold',
    });
    render(<Fight />);

    expect(document.body).toHaveTextContent('Fight pending...');
    expect(document.body).toHaveTextContent('Fight ID: 20');
    expect(document.body).toHaveTextContent('Reason: gold');
    expect(document.body).toHaveTextContent('Created: 2026-06-01T00:00:00.000Z');
    expect(document.body).not.toHaveTextContent('Details:');
    expect(screen.queryByRole('button', {name: /Strategy:/})).not.toBeInTheDocument();
  });
});
