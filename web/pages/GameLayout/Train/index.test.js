import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {SKILL_IDS} from 'shared/skills/index.js';

import Train from './index.js';


const {action, addAction, createFighterActionCmd, fighter, removeAction, removeFighterActionCmd} = vi.hoisted(() => {
  const fighter = {
    agility: 1n,
    constitution: 1n,
    idling: null,
    skill: 1n,
    stamina: 1n,
    strength: 1n,
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

const {biInfoCircle} = vi.hoisted(() => ({
  biInfoCircle: vi.fn((props) => <svg data-testid="skill-info-icon" {...props} />),
}));

const fighterActions = vi.hoisted(() => ({
  actions: [
    {action: 2, id: 5, progress: 23},
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

vi.mock('shared/skills/index.js', async () => {
  const actual = await vi.importActual('shared/skills/index.js');

  return {
    ...actual,
    SKILL_DEFINITIONS: {
      begging: {
        action,
        description: 'Perhaps a satang?',
        duration: 3,
        name: '฿egging',
        requires: () => true,
      },
    },
    SKILL_IDS: {
      ...actual.SKILL_IDS,
      begging: 99,
    },
  };
});
vi.mock('@/actions/websockets/clientCommands.js', () => ({
  createFighterActionCmd: (...args) => createFighterActionCmd(...args),
  removeFighterActionCmd: (...args) => removeFighterActionCmd(...args),
}));
vi.mock('react-icons/bi', () => ({
  BiInfoCircle: biInfoCircle,
}));

describe('Train', () => {
  afterEach(() => {
    fighter.idling = null;
    fighterActions.actions = [
      {action: 2, id: 5, progress: 23},
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
    fighterActions.actions = [{action: SKILL_IDS.begging, id: 6, progress: 77}];
    render(<Train />);

    expect(screen.queryByRole('heading', {name: 'Training Regimen:'})).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', {name: 'Skills:'})).not.toBeInTheDocument();
    expect(screen.getByText('฿egging')).toBeInTheDocument();
    expect(screen.getByLabelText('฿egging info')).toBeInTheDocument();

    expect(screen.getByRole('progressbar', {name: '฿egging completion'})).toHaveAttribute('aria-valuenow', '77');
    expect(screen.getByRole('button', {name: 'STOP'})).toBeInTheDocument();
  });

  it('shows and hides skill tooltip on hover', async () => {
    const user = userEvent.setup();
    render(<Train />);
    const skillName = screen.getByText('฿egging');

    await user.hover(skillName);

    expect(screen.getByText('Perhaps a satang? (3s)')).toBeInTheDocument();

    await user.unhover(skillName);

    expect(screen.queryByText('Perhaps a satang? (3s)')).not.toBeInTheDocument();
  });

  it('toggles the skill tooltip on click', async () => {
    render(<Train />);
    const infoIcon = screen.getByLabelText('฿egging info');

    fireEvent.click(infoIcon);

    expect(screen.getByText('Perhaps a satang? (3s)')).toBeInTheDocument();
    expect(infoIcon).toHaveAttribute('aria-expanded', 'true');
    expect(infoIcon.getAttribute('aria-describedby')).toMatch(/^skill-tooltip-begging/);

    fireEvent.click(infoIcon);

    expect(screen.queryByText('Perhaps a satang? (3s)')).not.toBeInTheDocument();
    expect(infoIcon).toHaveAttribute('aria-expanded', 'false');
  });

  it('uses an opaque tooltip background token', () => {
    const directoryPath = path.dirname(fileURLToPath(import.meta.url));
    const modulePath = path.join(directoryPath, 'Train.module.css');
    const source = fs.readFileSync(modulePath, 'utf8');

    expect(source).toMatch(/\.infoTooltip\s*{[^}]*background-color:\s*var\(--color-bg\);/s);
  });

  it('renders the BoxIcon for skill info', () => {
    render(<Train />);
    expect(screen.getByTestId('skill-info-icon')).toBeInTheDocument();
    expect(biInfoCircle).toHaveBeenCalled();
  });

  it('shows gray progress bar for inactive skills', () => {
    fighterActions.actions = [];
    render(<Train />);
    const button = screen.getByRole('button', {name: 'IDLE'});
    const progressLabel = screen.getByText('0%');

    expect(screen.getByRole('progressbar', {name: '฿egging completion'})).toHaveAttribute('aria-valuenow', '0');
    expect(button.className).toContain('actionButton');
    expect(progressLabel.className).toContain('regimenProgressLabelDisabled');
  });

  it('starts idling for a skill when idle is clicked', async () => {
    const user = userEvent.setup();
    render(<Train />);

    await user.click(screen.getByRole('button', {name: 'IDLE'}));

    expect(addAction).toHaveBeenCalledWith({action: SKILL_IDS.begging});
    expect(createFighterActionCmd).toHaveBeenCalledWith(SKILL_IDS.begging);
  });

  it('shows stop control for enabled actions and sends stop command when clicked', async () => {
    fighterActions.actions = [{action: SKILL_IDS.begging, id: 6, progress: 77}];
    fighter.idling = {key: 'train-begging'};
    const user = userEvent.setup();
    render(<Train />);

    const button = screen.getByRole('button', {name: 'STOP'});

    await user.click(button);

    expect(button.className).toContain('actionButton');
    expect(removeAction).toHaveBeenCalledWith(SKILL_IDS.begging);
    expect(removeFighterActionCmd).toHaveBeenCalledWith(SKILL_IDS.begging);
  });
});
