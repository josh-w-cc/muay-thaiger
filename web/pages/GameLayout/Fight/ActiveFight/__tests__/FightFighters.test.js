import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import FightFighters from '../FightFighters.js';
import css from '../../Fight.module.css';

const details = {
  attacker: {
    race: 1,
    startingStats: {health: 200n, stamina: 200n},
    stats: {attack: 1111111n, defense: 2222222n, health: 170n, stamina: 150n},
  },
  defender: {
    race: 2,
    startingStats: {health: 200n, stamina: 200n},
    stats: {attack: 3333333n, defense: 4444444n, health: 143n, stamina: 180n},
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
