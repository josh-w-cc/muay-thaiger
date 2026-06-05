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
          attacker: {moves: ['Cross', 'Knee']},
          strategy: 'Counter Rush',
        }}
      />,
    );

    expect(screen.getByRole('button', {name: 'Strategy: Counter Rush'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Cross'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Knee'})).toBeInTheDocument();
  });

  it('renders move names when server details include move metadata objects', () => {
    render(
      <FightLoadout
        details={{
          attacker: {moves: [{id: 1, lastUsed: 1700000000}, {id: 2, lastUsed: null}]},
          strategy: 'Counter Rush',
        }}
      />,
    );

    expect(screen.getByRole('button', {name: 'Wild Punch'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Wild Kick'})).toBeInTheDocument();
  });
});
