import {render, screen} from '@testing-library/react';

import css from './Stats.module.css';

vi.mock('./TrainStat.js', () => ({
  default: ({name, stat}) => <div data-stat={stat}>{name}</div>,
}));

describe('Stats', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('applies the stats list class', async () => {
    const {default: Stats} = await import('./Stats.js');
    const {container} = render(<Stats />);

    expect(container.firstChild).toHaveClass(css.stats);
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
