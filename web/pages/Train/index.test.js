import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {SKILL_IDS} from 'shared/skills.js';

import Train from './index.js';


const {action, addAction, createFighterActionCmd, fighter, removeAction, removeFighterActionCmd} = vi.hoisted(() => {
  const fighter = {
    agility: 1,
    constitution: 1,
    idling: null,
    skill: 1,
    stamina: 1,
    strength: 1,
  };

  return {
    action: vi.fn(),
    addAction: vi.fn(),
    createFighterActionCmd: vi.fn(),
    fighter,
    removeAction: vi.fn(),
    removeFighterActionCmd: vi.fn(),
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

    expect(screen.queryByRole('heading', {name: 'Training'})).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', {name: 'Stats:'})).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', {name: 'Training Regimen:'})).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'IDLE'})).toBeInTheDocument();
    expect(container.querySelector('br')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Once'})).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', {name: 'Skills:'})).not.toBeInTheDocument();
  });

  it('shows training regimen with progress bar and button for each skill', () => {
    fighterActions.actions = [{action_id: SKILL_IDS.begging, id: 6, progress: 77}];
    render(<Train />);

    expect(screen.queryByRole('heading', {name: 'Training Regimen:'})).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', {name: 'Skills:'})).not.toBeInTheDocument();
    expect(screen.getByText('฿egging')).toBeInTheDocument();

    expect(screen.getByRole('progressbar', {name: '฿egging completion'})).toHaveAttribute('aria-valuenow', '77');
    expect(screen.getByRole('button', {name: 'STOP'})).toBeInTheDocument();
  });

  it('shows gray progress bar for inactive skills', () => {
    fighterActions.actions = [];
    render(<Train />);

    expect(screen.getByRole('progressbar', {name: '฿egging completion'})).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('button', {name: 'IDLE'})).toBeInTheDocument();
  });

  it('wraps the train sections in a page container with extra top spacing', () => {
    const directoryPath = path.dirname(fileURLToPath(import.meta.url));
    const modulePath = path.join(directoryPath, 'Train.module.css');
    const source = fs.readFileSync(modulePath, 'utf8');
    const {container} = render(<Train />);

    expect(container.firstElementChild?.tagName).toBe('DIV');
    expect(source).toMatch(/\.page\s*{[^}]*padding-top:\s*var\(--space-xl\);/s);
  });

  it('starts idling for a skill when idle is clicked', async () => {
    const user = userEvent.setup();
    render(<Train />);

    await user.click(screen.getByRole('button', {name: 'IDLE'}));

    expect(addAction).toHaveBeenCalledWith({action_id: SKILL_IDS.begging});
    expect(createFighterActionCmd).toHaveBeenCalledWith(SKILL_IDS.begging);
  });

  it('shows stop control for enabled actions and sends stop command when clicked', async () => {
    fighterActions.actions = [{action_id: SKILL_IDS.begging, id: 6, progress: 77}];
    fighter.idling = {key: 'train-begging'};
    const user = userEvent.setup();
    render(<Train />);

    await user.click(screen.getByRole('button', {name: 'STOP'}));

    expect(removeAction).toHaveBeenCalledWith(SKILL_IDS.begging);
    expect(removeFighterActionCmd).toHaveBeenCalledWith(SKILL_IDS.begging);
  });
});
