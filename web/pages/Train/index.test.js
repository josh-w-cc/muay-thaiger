import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {SKILL_IDS} from 'shared/skills.js';

import Train from './index.js';


const {action, createFighterActionCmd, fighter, idle} = vi.hoisted(() => {
  const idle = vi.fn();
  const fighter = {
    agility: 1,
    constitution: 1,
    idling: null,
    idle,
    skill: 1,
    stamina: 1,
    strength: 1,
  };

  return {
    action: vi.fn(),
    createFighterActionCmd: vi.fn(),
    fighter,
    idle,
  };
});

vi.mock('@/data/fighter.js', () => ({
  default: () => fighter,
}));

vi.mock('./Skills.js', () => ({
  default: {
    begging: {
      action,
      name: '฿egging',
      requires: () => true,
    },
  },
}));
vi.mock('@/actions/websockets/index.js', () => ({
  createFighterActionCmd: (...args) => createFighterActionCmd(...args),
}));

describe('Train', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows only idle controls for skills', () => {
    const {container} = render(<Train />);

    expect(screen.getByRole('button', {name: 'Idle'})).toBeInTheDocument();
    expect(container.querySelector('br')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Once'})).not.toBeInTheDocument();
  });

  it('shows mock training regimen options with progress bars', () => {
    render(<Train />);

    expect(screen.getByRole('heading', {name: 'Training Regimen:'})).toBeInTheDocument();
    expect(screen.getByText('Footwork Ladder')).toBeInTheDocument();
    expect(screen.getByText('Pad Work')).toBeInTheDocument();
    expect(screen.getByText('Clinch Rounds')).toBeInTheDocument();

    expect(screen.getByRole('progressbar', {name: 'Footwork Ladder completion'})).toHaveAttribute('aria-valuenow', '34');
    expect(screen.getByRole('progressbar', {name: 'Pad Work completion'})).toHaveAttribute('aria-valuenow', '61');
    expect(screen.getByRole('progressbar', {name: 'Clinch Rounds completion'})).toHaveAttribute('aria-valuenow', '86');
  });

  it('starts idling for a skill when idle is clicked', async () => {
    const user = userEvent.setup();
    render(<Train />);

    await user.click(screen.getByRole('button', {name: 'Idle'}));

    expect(idle).toHaveBeenCalledTimes(1);
    expect(idle).toHaveBeenCalledWith('train-begging', expect.any(Function));
    expect(createFighterActionCmd).toHaveBeenCalledWith(SKILL_IDS.begging);
  });
});
