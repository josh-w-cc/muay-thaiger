import {render, screen, within} from '@testing-library/react';
import statListBaseCSS from '@/components/primitive/css-modules/stat-list-base.module.css';

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
  gold: 2100n,
  health: 25,
  vigor: 14,
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

  it('renders fighter details section with name, age, and race without stats', () => {
    render(<Hub />);

    expect(screen.queryByRole('heading', {name: 'Fighter Details:'})).not.toBeInTheDocument();
    expect(screen.getByText('Name').closest('div')).toBeInTheDocument();
    expect(within(screen.getByText('Name').closest('div')).getByText('Iron Tiger')).toBeInTheDocument();
    expect(screen.getByText('Race', {selector: 'dt'}).closest('div')).toBeInTheDocument();
    expect(within(screen.getByText('Race', {selector: 'dt'}).closest('div')).getByText('Tiger')).toBeInTheDocument();
    expect(screen.getByText('Age').closest('div')).toBeInTheDocument();
    expect(screen.queryByRole('heading', {name: 'Stats:'})).not.toBeInTheDocument();
    expect(screen.queryByText('Stanima', {selector: 'dt'})).not.toBeInTheDocument();
  });

  it('renders hub layout without the stats section', () => {
    const {container} = render(<Hub />);
    const detailFieldCount = 3;

    expect(container.querySelector('dl')).toBeInTheDocument();
    expect(container.querySelectorAll('dl > div')).toHaveLength(detailFieldCount);
    expect(container.querySelector('br')).not.toBeInTheDocument();
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

  it('renders wins leaderboard and a second trainable stat leaderboard', () => {
    render(<Hub />);

    expect(screen.getByRole('heading', {name: 'Leaderboard:'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: 'Trainable Stat Leaders:'})).toBeInTheDocument();
    const leaderboards = screen.getAllByRole('table');

    expect(leaderboards).toHaveLength(2);
    const winsLeaderboard = leaderboards[0];
    const statsLeaderboard = leaderboards[1];

    expect(within(winsLeaderboard).getByText('Wins')).toBeInTheDocument();
    expect(within(winsLeaderboard).queryByText('Top Value')).not.toBeInTheDocument();
    expect(within(winsLeaderboard).getByText('Iron Cobra')).toBeInTheDocument();
    expect(within(winsLeaderboard).getByText('Shadow Fang')).toBeInTheDocument();
    expect(within(winsLeaderboard).getByText('Burning Lotus')).toBeInTheDocument();
    expect(within(winsLeaderboard).getByText('Stone Viper')).toBeInTheDocument();
    expect(within(winsLeaderboard).getByText('Red Hawk')).toBeInTheDocument();

    expect(within(statsLeaderboard).getByText('Top Value')).toBeInTheDocument();
    expect(within(statsLeaderboard).getByText('Agility')).toBeInTheDocument();
    expect(within(statsLeaderboard).getByText('Constitution')).toBeInTheDocument();
    expect(within(statsLeaderboard).getByText('Skill')).toBeInTheDocument();
    expect(within(statsLeaderboard).getByText('Stanima')).toBeInTheDocument();
    expect(within(statsLeaderboard).getByText('Strength')).toBeInTheDocument();
    expect(within(statsLeaderboard).getByText('Iron Cobra')).toBeInTheDocument();
    expect(within(statsLeaderboard).getByText('Shadow Fang')).toBeInTheDocument();
    expect(within(statsLeaderboard).getByText('Burning Lotus')).toBeInTheDocument();
    expect(within(statsLeaderboard).getByText('Stone Viper')).toBeInTheDocument();
    expect(within(statsLeaderboard).getByText('Red Hawk')).toBeInTheDocument();
    expect(within(statsLeaderboard).queryByText('Reach')).not.toBeInTheDocument();
  });

  it('renders fighter details with shared stat-list styling', () => {
    const {container} = render(<Hub />);

    expect(container.querySelector('dl')).toHaveClass(statListBaseCSS.statListBase);
  });
});
