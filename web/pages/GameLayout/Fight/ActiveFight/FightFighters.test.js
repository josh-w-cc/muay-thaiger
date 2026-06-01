import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import FightFighters from './FightFighters.js';
import css from '../Fight.module.css';

describe('FightFighters', () => {
  it('renders stamina progress bars for both fighters', () => {
    render(<FightFighters />);

    expect(screen.getByRole('progressbar', {name: 'Tiger fighter stamina'})).toHaveAttribute('aria-valuenow', '150');
    expect(screen.getByRole('progressbar', {name: 'Tiger fighter stamina'})).toHaveAttribute('aria-valuemax', '200');
    expect(screen.getByRole('progressbar', {name: 'Snow leopard fighter stamina'})).toHaveAttribute('aria-valuenow', '180');
    expect(screen.getByRole('progressbar', {name: 'Snow leopard fighter stamina'})).toHaveAttribute('aria-valuemax', '200');
  });

  it('uses stamina bar classes for the rendered stamina progress bars', () => {
    render(<FightFighters />);

    const tigerStaminaBar = screen.getByRole('progressbar', {name: 'Tiger fighter stamina'});
    const tigerStaminaBarFill = tigerStaminaBar.querySelector('div');
    const snowLeopardStaminaBar = screen.getByRole('progressbar', {name: 'Snow leopard fighter stamina'});
    const snowLeopardStaminaBarFill = snowLeopardStaminaBar.querySelector('div');

    expect(tigerStaminaBar).toHaveClass(css.fightStaminaBar);
    expect(tigerStaminaBarFill).toHaveClass(css.fill);
    expect(snowLeopardStaminaBar).toHaveClass(css.fightStaminaBar);
    expect(snowLeopardStaminaBarFill).toHaveClass(css.fill);
  });
});
