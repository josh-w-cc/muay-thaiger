import 'shared/bigInt.js';

import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import sectionCss from '@/components/primitive/Section.module.css';
import SnowLeopardMuayThaiReady from './assets/SnowLeopardMuayThaiReady.png';
import TigerMuayThai from './assets/TigerMuayThai.png';
import css from './Fight.module.css';
import Fight from './index.js';


const {fighter, fightState, createFightCmd, attack, finish, needsZerothFight} = vi.hoisted(() => ({
  attack: vi.fn(),
  createFightCmd: vi.fn(),
  fighter: {gold: 500, id: 1, stamina: 1, strength: 1},
  fightState: {},
  finish: vi.fn(),
  needsZerothFight: vi.fn(),
}));

vi.mock('@/data/fighter.js', () => ({
  default: () => fighter,
}));

vi.mock('@/data/fight.js', () => ({
  FIGHT_IN_PROGRESS: 'in-progress',
  FIGHT_LOST: 'lost',
  FIGHT_NOT_STARTED: 'not-started',
  FIGHT_WON: 'won',
  default: () => fightState,
}));

vi.mock('@/actions/websockets/clientCommands.js', () => ({
  createFightCmd,
}));

vi.mock('./ZerothFight.js', () => ({
  default: function MockZerothFight() {
    return <div>Zeroth Fight</div>;
  },
  needsZerothFight: (...args) => needsZerothFight(...args),
}));

describe('Fight', () => {
  beforeEach(() => {
    attack.mockReturnValue('');
    needsZerothFight.mockReturnValue(false);
    Object.assign(fightState, {
      attack,
      fighters: [
        {currentHealth: '200', stats: {}},
        {currentHealth: '100', stats: {}},
      ],
      finish,
      messages: [],
      state: 'not-started',
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
    expect(within(glorySection).getByText('Strategy: Pressure Counter')).toBeInTheDocument();
    expect(within(glorySection).getByRole('img', {name: 'Tiger Muay Thai fighter'}))
      .toHaveAttribute('src', expect.stringContaining(TigerMuayThai));
    expect(within(glorySection).getByRole('img', {name: 'Snow leopard Muay Thai fighter'}))
      .toHaveAttribute('src', expect.stringContaining(SnowLeopardMuayThaiReady));
    const healthBars = within(glorySection).getAllByRole('progressbar');
    expect(healthBars).toHaveLength(4);
    expect(within(glorySection).getByRole('progressbar', {name: 'Tiger fighter health'})).toBeInTheDocument();
    expect(within(glorySection).getByRole('progressbar', {name: 'Snow leopard fighter health'})).toBeInTheDocument();
    expect(within(glorySection).getByRole('progressbar', {name: 'Tiger fighter stamina'})).toBeInTheDocument();
    expect(within(glorySection).getByRole('progressbar', {name: 'Snow leopard fighter stamina'})).toBeInTheDocument();
    expect(within(glorySection).getAllByRole('separator')).toHaveLength(1);
    expect(within(glorySection).getByRole('separator')).toHaveClass(css.fightFighterDivider);
    const fighterCards = glorySection.querySelectorAll(`.${css.fightFighter}`);
    fighterCards.forEach((card) => {
      expect(card).not.toHaveTextContent('A:');
      expect(card).not.toHaveTextContent('D:');
    });
    expect(within(glorySection).getByRole('button', {name: 'Strategy: Pressure Counter'})).toHaveClass(css.tapperButton);
    expect(glorySection).toHaveTextContent('A: 7.50e6');
    expect(glorySection).toHaveTextContent('D: 6.00e6');
    expect(glorySection).toHaveTextContent('A: 6.50e6');
    expect(glorySection).toHaveTextContent('D: 8.00e6');
    expect(glorySection).toHaveTextContent('Tiger throws Jab');
    expect(glorySection).toHaveTextContent('Lands for 18 damage!');
    expect(glorySection).toHaveTextContent('Snow Leopard throws Roundhouse');
    expect(glorySection).toHaveTextContent('Misses clean.');
    within(glorySection).getAllByText('Tiger', {selector: 'strong'})
      .forEach((element) => expect(element).toHaveClass(css.fightFeedAttackerSelf));
    within(glorySection).getAllByText('Snow Leopard', {selector: 'strong'})
      .forEach((element) => expect(element).toHaveClass(css.fightFeedAttackerEnemy));
    const feedItems = within(glorySection).getAllByRole('listitem');
    expect(feedItems.length).toBeGreaterThanOrEqual(12);
    expect(feedItems[0]).toHaveClass(css.fightFeedItem);
  });

  it('sends a fight command when clicking Fight', async () => {
    const user = userEvent.setup();
    render(<Fight />);

    await user.click(screen.getByRole('button', {name: 'Fight!'}));

    expect(createFightCmd).toHaveBeenCalledTimes(1);
  });

  it('shows in-progress stats and attack message', async () => {
    const user = userEvent.setup();
    attack.mockReturnValue('POW!');
    Object.assign(fightState, {
      fighters: [
        {currentHealth: 900n, stats: {apm: 1n, attack: 2n, defense: 3n, health: 4n, power: 5n, stamina: 6n}},
        {currentHealth: 800n, stats: {apm: 7n, attack: 8n, defense: 9n, health: 100000n, power: 11n, stamina: 12n}},
      ],
      messages: ['msg-a', 'msg-b'],
      state: 'in-progress',
    });
    render(<Fight />);

    await user.click(screen.getByRole('button', {name: 'Attack!'}));

    expect(attack).toHaveBeenCalledWith(0);
    expect(screen.getByRole('heading', {name: 'POW!'})).toBeInTheDocument();
    expect(document.body).toHaveTextContent('1.00e5');
    expect(document.body).toHaveTextContent('Stanima:');
    expect(document.body).toHaveTextContent('msg-a');
    expect(document.body).toHaveTextContent('msg-b');
  });

  it.each(['won', 'lost'])('restarts when fight is %s', async (state) => {
    const user = userEvent.setup();
    Object.assign(fightState, {state});
    render(<Fight />);

    await user.click(screen.getByRole('button', {name: 'Again?'}));

    expect(finish).toHaveBeenCalledTimes(1);
  });
});
