import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
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
    vi.spyOn(Date, 'now').mockReturnValue(10_000);
    resetMovesStore();
    useMovesStore.getState().setMoves([
      {id: 1, name: 'Cross', recovery: 6},
      {id: 2, name: 'Knee', recovery: 2.5},
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  it('syncs fill animation start to move lastUsed and keeps fallback delays otherwise', () => {
    render(
      <FightLoadout
        details={{
          attacker: {moves: [{id: 1, lastUsed: 4_000}, {id: 2, lastUsed: 9_000}]},
          strategy: 'Counter Rush',
        }}
      />,
    );

    const strategyFill = screen.getByRole('button', {name: 'Strategy: Counter Rush'}).querySelector('[aria-hidden="true"]');
    const crossFill = screen.getByRole('button', {name: 'Cross'}).querySelector('[aria-hidden="true"]');
    const kneeFill = screen.getByRole('button', {name: 'Knee'}).querySelector('[aria-hidden="true"]');

    expect(strategyFill).toHaveStyle({animationDelay: '0s'});
    expect(crossFill).toHaveStyle({animationDelay: '-6s', animationDuration: '6s'});
    expect(kneeFill).toHaveStyle({animationDelay: '-1s', animationDuration: '2.5s'});
  });

  it('restarts move fill animation when server updates lastUsed', () => {
    const {rerender} = render(
      <FightLoadout
        details={{
          attacker: {moves: [{id: 1, lastUsed: 4_000}]},
          strategy: 'Counter Rush',
        }}
      />,
    );

    const originalCrossFill = screen.getByRole('button', {name: 'Cross'}).querySelector('[aria-hidden="true"]');
    expect(originalCrossFill).toHaveStyle({animationDelay: '-6s'});

    rerender(
      <FightLoadout
        details={{
          attacker: {moves: [{id: 1, lastUsed: 9_500}]},
          strategy: 'Counter Rush',
        }}
      />,
    );

    const updatedCrossFill = screen.getByRole('button', {name: 'Cross'}).querySelector('[aria-hidden="true"]');
    expect(updatedCrossFill).toHaveStyle({animationDelay: '-0.5s'});
    expect(updatedCrossFill).not.toBe(originalCrossFill);
  });

  it('stops move fill animation after recovery has elapsed', () => {
    render(
      <FightLoadout
        details={{
          attacker: {moves: [{id: 1, lastUsed: 3_000}]},
          strategy: 'Counter Rush',
        }}
      />,
    );

    const crossFill = screen.getByRole('button', {name: 'Cross'}).querySelector('[aria-hidden="true"]');

    expect(crossFill).toHaveStyle({animationName: 'none', transform: 'scaleX(0)'});
  });
});
