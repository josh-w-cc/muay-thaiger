import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Fight from './index.js';


const {fighter, fightState, forGold, attack, finish, needsZerothFight} = vi.hoisted(() => ({
  attack: vi.fn(),
  fighter: {gold: 500, id: 1, stamina: 1, strength: 1},
  fightState: {},
  finish: vi.fn(),
  forGold: vi.fn(),
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
      forGold,
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
    const section = container.querySelector('section');

    expect(section).toBeInTheDocument();
    expect(within(section).getByRole('heading', {name: 'Fight for ฿'})).toBeInTheDocument();
  });

  it('starts a fight for selected risk', async () => {
    const user = userEvent.setup();
    render(<Fight />);

    await user.selectOptions(screen.getByRole('combobox'), '4');
    await user.click(screen.getByRole('button', {name: 'Fight!'}));

    expect(forGold).toHaveBeenCalledTimes(1);
    expect(forGold).toHaveBeenCalledWith(fighter, '4');
  });

  it('shows in-progress stats and attack message', async () => {
    const user = userEvent.setup();
    attack.mockReturnValue('POW!');
    Object.assign(fightState, {
      fighters: [
        {currentHealth: '900', stats: {apm: '1', attack: '2', defense: '3', health: '4', power: '5', stamina: '6'}},
        {currentHealth: '800', stats: {apm: '7', attack: '8', defense: '9', health: '10', power: '11', stamina: '12'}},
      ],
      messages: ['msg-a', 'msg-b'],
      state: 'in-progress',
    });
    render(<Fight />);

    await user.click(screen.getByRole('button', {name: 'Attack!'}));

    expect(attack).toHaveBeenCalledWith(0);
    expect(screen.getByRole('heading', {name: 'POW!'})).toBeInTheDocument();
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
