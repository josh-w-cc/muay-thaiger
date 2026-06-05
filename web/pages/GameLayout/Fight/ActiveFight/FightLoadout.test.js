import {render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it} from 'vitest';
import useMovesStore, {resetMovesStore} from '@/data/moves.js';

import FightLoadout from './FightLoadout.js';


describe('FightLoadout', () => {
  beforeEach(() => {
    resetMovesStore();
    useMovesStore.getState().setMoves([
      {id: 1, name: 'Cross', recovery: 6},
      {id: 2, name: 'Knee', recovery: 2.5},
    ]);
  });

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
          attacker: {moves: [{id: 1, lastUsed: 123}, {id: 2, lastUsed: 456}]},
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
              {id: 1, lastUsed: 123},
              {id: 2, lastUsed: 456},
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
