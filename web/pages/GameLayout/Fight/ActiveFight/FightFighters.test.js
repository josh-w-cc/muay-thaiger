import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import FightFighters from './FightFighters.js';
import css from '../Fight.module.css';

const details = {
  attacker: {
    calculatedStats: {attack: 1111111n, defense: 2222222n, health: 170},
    race: 1,
    startingStats: {health: 200, stamina: 200},
    stats: {health: 170, stamina: 150},
  },
  defender: {
    calculatedStats: {attack: 3333333n, defense: 4444444n, health: 143},
    race: 2,
    startingStats: {health: 200, stamina: 200},
    stats: {health: 143, stamina: 180},
  },
};

describe('FightFighters', () => {
  it('renders stamina progress bars for both fighters', () => {
    render(<FightFighters details={details} />);

    expect(screen.getByRole('progressbar', {name: 'Tiger fighter stamina'})).toHaveAttribute('aria-valuenow', '150');
    expect(screen.getByRole('progressbar', {name: 'Tiger fighter stamina'})).toHaveAttribute('aria-valuemax', '200');
    expect(screen.getByRole('progressbar', {name: 'Snow leopard fighter stamina'})).toHaveAttribute('aria-valuenow', '180');
    expect(screen.getByRole('progressbar', {name: 'Snow leopard fighter stamina'})).toHaveAttribute('aria-valuemax', '200');
    expect(screen.getByRole('progressbar', {name: 'Tiger fighter health'})).toHaveAttribute('aria-valuenow', '170');
    expect(screen.getByRole('progressbar', {name: 'Snow leopard fighter health'})).toHaveAttribute('aria-valuenow', '143');
  });

  it('uses stamina bar classes for the rendered stamina progress bars', () => {
    render(<FightFighters details={details} />);

    const tigerStaminaBar = screen.getByRole('progressbar', {name: 'Tiger fighter stamina'});
    const tigerStaminaBarFill = tigerStaminaBar.querySelector('div');
    const snowLeopardStaminaBar = screen.getByRole('progressbar', {name: 'Snow leopard fighter stamina'});
    const snowLeopardStaminaBarFill = snowLeopardStaminaBar.querySelector('div');
    const tigerHealthBar = screen.getByRole('progressbar', {name: 'Tiger fighter health'});
    const snowLeopardHealthBar = screen.getByRole('progressbar', {name: 'Snow leopard fighter health'});

    expect(tigerStaminaBar).toHaveClass(css.fightStaminaBar);
    expect(tigerStaminaBarFill).toHaveClass(css.fill);
    expect(snowLeopardStaminaBar).toHaveClass(css.fightStaminaBar);
    expect(snowLeopardStaminaBarFill).toHaveClass(css.fill);
    expect(tigerHealthBar).toHaveClass(css.fightHealthBar);
    expect(snowLeopardHealthBar).toHaveClass(css.fightHealthBar);
    expect(tigerStaminaBar).not.toHaveAttribute('style');
    expect(snowLeopardStaminaBar).not.toHaveAttribute('style');
    expect(tigerHealthBar).not.toHaveAttribute('style');
    expect(snowLeopardHealthBar).not.toHaveAttribute('style');
  });
});
