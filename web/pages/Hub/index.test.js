import {render, screen, within} from '@testing-library/react';

import Hub from './index.js';


const fighter = vi.hoisted(() => ({
  agility: 11,
  anima: 16,
  apm: 22,
  attack: 23,
  constitution: 19,
  defense: 24,
  durability: 17,
  gold: 2100,
  health: 25,
  innateStrength: 14,
  power: 26,
  reach: 18,
  skill: 20,
  speed: 12,
  stamina: 21,
  strength: 13,
  vitality: 15,
}));

const fighterActions = vi.hoisted(() => ({
  actions: [
    {action_id: 2, id: 5},
    {action_id: 1, id: 6},
  ],
}));

vi.mock('@/data/fighter.js', () => ({
  default: () => fighter,
}));

vi.mock('@/data/fighterActions.js', () => ({
  default: () => fighterActions,
}));

describe('Hub', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders stats in a readable list layout', () => {
    const {container} = render(<Hub />);

    expect(container.querySelector('dl')).toBeInTheDocument();
    expect(container.querySelectorAll('dl > div')).toHaveLength(17);
    expect(container.querySelector('br')).not.toBeInTheDocument();
    const staminaRow = screen.getByText('Stanima').closest('div');

    expect(staminaRow).toBeInTheDocument();
    expect(within(staminaRow).getByText('21')).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Events:'})).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Walking')).toBeInTheDocument();
    expect(screen.getByText('฿egging')).toBeInTheDocument();
    expect(screen.getAllByText('train')).toHaveLength(2);
  });
});
