import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Train from './index.jsx';


const {action, fighter, idle} = vi.hoisted(() => {
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
    fighter,
    idle,
  };
});

vi.mock('../../Fighter.js', () => ({
  default: () => fighter,
}));

vi.mock('./Skills.js', () => ({
  default: {
    beg: {
      action,
      name: '฿egging',
      requires: () => true,
    },
  },
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

  it('starts idling for a skill when idle is clicked', async () => {
    const user = userEvent.setup();
    render(<Train />);

    await user.click(screen.getByRole('button', {name: 'Idle'}));

    expect(idle).toHaveBeenCalledTimes(1);
    expect(idle).toHaveBeenCalledWith('train-beg', expect.any(Function));
  });
});
