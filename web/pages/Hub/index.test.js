import {render, screen, within} from '@testing-library/react';

import Hub from './index.js';


const fighter = vi.hoisted(() => ({
  agility: 11,
  anima: 16,
  apm: 22,
  attack: 23,
  constitution: 19,
  createdAt: '2026-01-01T00:00:00.000Z',
  defense: 24,
  displayName: 'Iron Tiger',
  durability: 17,
  gold: 2100,
  health: 25,
  innateStrength: 14,
  power: 26,
  race: '1',
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

  it('renders fighter details section with name, age, and race', () => {
    render(<Hub />);

    expect(screen.getByRole('heading', {name: 'Fighter Details:'})).toBeInTheDocument();
    expect(screen.getByText('Name').closest('div')).toBeInTheDocument();
    expect(within(screen.getByText('Name').closest('div')).getByText('Iron Tiger')).toBeInTheDocument();
    expect(screen.getByText('Race', {selector: 'dt'}).closest('div')).toBeInTheDocument();
    expect(within(screen.getByText('Race', {selector: 'dt'}).closest('div')).getByText('Tiger')).toBeInTheDocument();
    expect(screen.getByText('Age').closest('div')).toBeInTheDocument();
  });

  it('renders stats in a readable list layout', () => {
    const {container} = render(<Hub />);

    expect(container.querySelector('dl')).toBeInTheDocument();
    expect(container.querySelectorAll('dl > div')).toHaveLength(20);
    expect(container.querySelector('br')).not.toBeInTheDocument();
    const staminaRow = screen.getByText('Stanima', {selector: 'dt'}).closest('div');

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

  it('renders leaderboard with one fighter for each trainable stat', () => {
    render(<Hub />);

    expect(screen.getByRole('heading', {name: 'Leaderboard:'})).toBeInTheDocument();
    const leaderboard = screen.getByRole('table');

    expect(leaderboard).toBeInTheDocument();

    const rows = screen.getAllByRole('row');

    expect(rows).toHaveLength(6);
    expect(within(leaderboard).getByText('Agility')).toBeInTheDocument();
    expect(within(leaderboard).getByText('Constitution')).toBeInTheDocument();
    expect(within(leaderboard).getByText('Skill')).toBeInTheDocument();
    expect(within(leaderboard).getByText('Stanima')).toBeInTheDocument();
    expect(within(leaderboard).getByText('Strength')).toBeInTheDocument();
    expect(within(leaderboard).getByText('Iron Cobra')).toBeInTheDocument();
    expect(within(leaderboard).getByText('Shadow Fang')).toBeInTheDocument();
    expect(within(leaderboard).getByText('Burning Lotus')).toBeInTheDocument();
    expect(within(leaderboard).getByText('Stone Viper')).toBeInTheDocument();
    expect(within(leaderboard).getByText('Red Hawk')).toBeInTheDocument();
    expect(within(leaderboard).queryByText('Anima')).not.toBeInTheDocument();
    expect(within(leaderboard).queryByText('Reach')).not.toBeInTheDocument();
  });
});
