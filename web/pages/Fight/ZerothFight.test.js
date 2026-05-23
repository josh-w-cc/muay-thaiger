import {render, screen} from '@testing-library/react';

import ZerothFight, {needsZerothFight} from './ZerothFight.js';


const {fighter} = vi.hoisted(() => ({
  fighter: {gold: 0, spend: vi.fn(), stamina: 1, strength: 1},
}));

vi.mock('@/data/fighter.js', () => ({
  default: () => fighter,
}));

describe('ZerothFight', () => {
  beforeEach(() => {
    Object.assign(fighter, {gold: 0, stamina: 1, strength: 1});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('requires zeroth fight when stats or gold are too low', () => {
    expect(needsZerothFight({gold: 99, stamina: 1, strength: 1})).toBe(true);
    expect(needsZerothFight({gold: 100, stamina: 0, strength: 1})).toBe(true);
    expect(needsZerothFight({gold: 100, stamina: 1, strength: 0})).toBe(true);
    expect(needsZerothFight({gold: 100, stamina: 1, strength: 1})).toBe(false);
  });

  it('shows the gold requirement message', () => {
    fighter.gold = 99;
    render(<ZerothFight />);

    expect(screen.getByText(/Come back when you have the/i)).toBeInTheDocument();
    expect(fighter.spend).not.toHaveBeenCalled();
  });

  it('spends all gold and shows the strength branch message', () => {
    Object.assign(fighter, {gold: 150, stamina: 1, strength: 0});
    render(<ZerothFight />);

    expect(fighter.spend).toHaveBeenCalledTimes(1);
    expect(fighter.spend).toHaveBeenCalledWith(150);
    expect(screen.getByText(/lack the/i)).toBeInTheDocument();
  });

  it('shows the stanima branch message when stamina is missing', () => {
    Object.assign(fighter, {gold: 150, stamina: 0, strength: 1});
    render(<ZerothFight />);

    expect(screen.getByText(/You need more/i)).toBeInTheDocument();
    expect(screen.getByText(/stanima/i)).toBeInTheDocument();
  });
});
