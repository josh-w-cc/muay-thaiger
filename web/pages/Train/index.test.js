import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {SKILL_IDS} from 'shared/skills.js';

import Train from './index.js';


const {action, addAction, createFighterActionCmd, fighter, idle, removeAction, removeFighterActionCmd, setFighterState} = vi.hoisted(() => {
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
    addAction: vi.fn(),
    createFighterActionCmd: vi.fn(),
    fighter,
    idle,
    removeAction: vi.fn(),
    removeFighterActionCmd: vi.fn(),
    setFighterState: vi.fn(),
  };
});

const fighterActions = vi.hoisted(() => ({
  actions: [
    {action_id: 2, id: 5, progress: 23},
  ],
}));

vi.mock('@/data/fighterActions.js', () => ({
  default: Object.assign(() => fighterActions, {
    getState: () => ({addAction, removeAction}),
  }),
}));

vi.mock('@/data/fighter.js', () => {
  const mockedStore = () => fighter;
  mockedStore.getState = () => fighter;
  mockedStore.setState = (...args) => setFighterState(...args);
  return {default: mockedStore};
});

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
  removeFighterActionCmd: (...args) => removeFighterActionCmd(...args),
}));

describe('Train', () => {
  afterEach(() => {
    fighter.idling = null;
    fighterActions.actions = [
      {action_id: 2, id: 5, progress: 23},
    ];
    vi.clearAllMocks();
  });

  it('shows only idle controls for skills', () => {
    const {container} = render(<Train />);

    expect(screen.getByRole('button', {name: 'IDLE'})).toBeInTheDocument();
    expect(container.querySelector('br')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Once'})).not.toBeInTheDocument();
  });

  it('shows training regimen from fighter actions store with progress bars', () => {
    fighterActions.actions = [
      {action_id: 2, id: 5, progress: 23},
      {action_id: 1, id: 6, progress: 77},
    ];
    render(<Train />);

    expect(screen.getByRole('heading', {name: 'Training Regimen:'})).toBeInTheDocument();
    expect(screen.getByText('Walking')).toBeInTheDocument();
    expect(screen.getAllByText('฿egging')).toHaveLength(2);

    expect(screen.getByRole('progressbar', {name: 'Walking completion'})).toHaveAttribute('aria-valuenow', '23');
    expect(screen.getByRole('progressbar', {name: '฿egging completion'})).toHaveAttribute('aria-valuenow', '77');
  });

  it('starts idling for a skill when idle is clicked', async () => {
    const user = userEvent.setup();
    render(<Train />);

    await user.click(screen.getByRole('button', {name: 'IDLE'}));

    expect(idle).toHaveBeenCalledTimes(1);
    expect(idle).toHaveBeenCalledWith('train-begging', expect.any(Function));
    expect(createFighterActionCmd).toHaveBeenCalledWith(SKILL_IDS.begging);
  });

  it('shows stop control for enabled actions and sends stop command when clicked', async () => {
    fighterActions.actions = [{action_id: SKILL_IDS.begging, id: 6, progress: 77}];
    fighter.idling = {key: 'train-begging'};
    const user = userEvent.setup();
    render(<Train />);

    await user.click(screen.getByRole('button', {name: 'STOP'}));

    expect(removeAction).toHaveBeenCalledWith(SKILL_IDS.begging);
    expect(setFighterState).toHaveBeenCalledWith({idling: false});
    expect(removeFighterActionCmd).toHaveBeenCalledWith(SKILL_IDS.begging);
  });
});
