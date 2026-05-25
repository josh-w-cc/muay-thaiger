import {render, screen} from '@testing-library/react';

import TrainStat from './TrainStat.js';


const fighter = vi.hoisted(() => ({
  stamina: 100,
  vitality: 7,
}));

vi.mock('@/data/fighter.js', () => ({
  default: () => fighter,
}));

describe('TrainStat', () => {
  it('renders the stat name, training rate, and current value', () => {
    render(<TrainStat name="Stanima" stat="stamina" />);

    expect(screen.getByText('Stanima')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('shows zero training rate when multiplier stat is missing', () => {
    render(<TrainStat name="Stanima" stat="stamina" />);

    fighter.vitality = undefined;
    render(<TrainStat name="Stanima" stat="stamina" />);

    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });
});
