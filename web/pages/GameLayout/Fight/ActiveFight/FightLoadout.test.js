import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it} from 'vitest';
import useMovesStore, {resetMovesStore} from '@/data/moves.js';

import FightLoadout from './FightLoadout.js';

const {moveCmd} = vi.hoisted(() => ({
  moveCmd: vi.fn(),
}));

vi.mock('@/actions/websockets/clientCommands.js', () => ({
  moveCmd,
}));


describe('FightLoadout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it('renders unknown move ids when a move definition is missing', () => {
    render(
      <FightLoadout
        details={{
          attacker: {moves: [{id: 99, lastUsed: 123}]},
          strategy: 'Counter Rush',
        }}
      />,
    );

    expect(screen.getByRole('button', {name: '99'})).toBeInTheDocument();
  });

  it('sends a move command when a move button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <FightLoadout
        details={{
          attacker: {moves: [{id: 1, lastUsed: 123}, {id: 2, lastUsed: 456}]},
          strategy: 'Counter Rush',
        }}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Knee'}));

    expect(moveCmd).toHaveBeenCalledWith(2);
  });
});
