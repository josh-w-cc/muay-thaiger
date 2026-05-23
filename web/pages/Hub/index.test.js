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

vi.mock('@/data/fighter.js', () => ({
  default: () => fighter,
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
    expect(screen.queryByRole('heading', {name: 'Events:'})).not.toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Technique: Flying Knee Drill')).toBeInTheDocument();
    expect(screen.getByText('Lumpinee Rookie Cup')).toBeInTheDocument();
    expect(screen.getByText('Camp Sparring Session')).toBeInTheDocument();
    expect(screen.getByText('Unlocked')).toBeInTheDocument();
    expect(screen.getByText('Tournament Win')).toBeInTheDocument();
    expect(screen.getByText('Skill Gain')).toBeInTheDocument();
    expect(screen.getByText('Unlocked Flying Knee Drill in Training.')).toBeInTheDocument();
    expect(screen.getByText('Won against Iron Cobra in the Lumpinee Bracket.')).toBeInTheDocument();
    expect(screen.getByText('Clinched 3 rounds in sparring and gained +2 Skill.')).toBeInTheDocument();
  });

  it('renders leaderboard with ranked fighter entries', () => {
    render(<Hub />);

    expect(screen.getByRole('heading', {name: 'Leaderboard:'})).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    const rows = screen.getAllByRole('row');

    expect(rows).toHaveLength(6);
    expect(screen.getByText('Iron Cobra')).toBeInTheDocument();
    expect(screen.getByText('Shadow Fang')).toBeInTheDocument();
    expect(screen.getByText('Burning Lotus')).toBeInTheDocument();
    expect(screen.getByText('Stone Viper')).toBeInTheDocument();
    expect(screen.getByText('Red Hawk')).toBeInTheDocument();
  });
});
