import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import FightLoadout from './FightLoadout.js';

describe('FightLoadout', () => {
  it('renders fallback strategy and moves when details are missing', () => {
    render(<FightLoadout />);

    expect(screen.getByRole('button', {name: 'Strategy: Pressure Counter'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Jab'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Roundhouse'})).toBeInTheDocument();
  });

  it('renders strategy and moves from server details when present', () => {
    render(
      <FightLoadout
        details={{
          attacker: {moves: [{name: 'Cross'}, {name: 'Knee'}]},
          strategy: 'Counter Rush',
        }}
      />,
    );

    expect(screen.getByRole('button', {name: 'Strategy: Counter Rush'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Cross'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Knee'})).toBeInTheDocument();
  });

  it('uses move recovery values for tapper button durations', () => {
    render(
      <FightLoadout
        details={{
          attacker: {
            moves: [
              {name: 'Cross', recovery: 6},
              {name: 'Knee', recovery: 2.5},
            ],
          },
          strategy: 'Counter Rush',
        }}
      />,
    );

    const crossButtonFill = screen.getByRole('button', {name: 'Cross'}).querySelector('span[aria-hidden="true"]');
    const kneeButtonFill = screen.getByRole('button', {name: 'Knee'}).querySelector('span[aria-hidden="true"]');
    expect(crossButtonFill).not.toBeNull();
    expect(kneeButtonFill).not.toBeNull();
    expect(crossButtonFill).toHaveStyle({animationDuration: '6s'});
    expect(kneeButtonFill).toHaveStyle({animationDuration: '2.5s'});
  });
});
