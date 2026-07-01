import {render, screen} from '@testing-library/react';

vi.mock('./TrainStat.js', () => ({
  default: ({name, stat}) => <div data-stat={stat}>{name}</div>,
}));

describe('Stats', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all training stat rows', async () => {
    const {default: Stats} = await import('./Stats.js');
    render(<Stats />);

    expect(screen.getByText('Agility')).toBeInTheDocument();
    expect(screen.getByText('Constitution')).toBeInTheDocument();
    expect(screen.getByText('Skill')).toBeInTheDocument();
    expect(screen.getByText('Stanima')).toBeInTheDocument();
    expect(screen.getByText('Strength')).toBeInTheDocument();
  });
});
