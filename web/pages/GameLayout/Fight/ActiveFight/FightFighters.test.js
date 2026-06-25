import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import FightFighters from './FightFighters.js';
import css from './FightFighters.module.css';

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
  it('renders stanima progress bars for both fighters', () => {
    render(<FightFighters details={details} />);

    expect(screen.getByRole('progressbar', {name: 'Tiger fighter stanima'})).toHaveAttribute('aria-valuenow', '150');
    expect(screen.getByRole('progressbar', {name: 'Tiger fighter stanima'})).toHaveAttribute('aria-valuemax', '200');
    expect(screen.getByRole('progressbar', {name: 'Snow leopard fighter stanima'})).toHaveAttribute('aria-valuenow', '180');
    expect(screen.getByRole('progressbar', {name: 'Snow leopard fighter stanima'})).toHaveAttribute('aria-valuemax', '200');
    expect(screen.getByRole('progressbar', {name: 'Tiger fighter health'})).toHaveAttribute('aria-valuenow', '170');
    expect(screen.getByRole('progressbar', {name: 'Snow leopard fighter health'})).toHaveAttribute('aria-valuenow', '143');
  });

  it('uses stanima bar classes for the rendered stanima progress bars', () => {
    render(<FightFighters details={details} />);

    const tigerStanimaBar = screen.getByRole('progressbar', {name: 'Tiger fighter stanima'});
    const tigerStanimaBarFill = tigerStanimaBar.querySelector('div');
    const snowLeopardStanimaBar = screen.getByRole('progressbar', {name: 'Snow leopard fighter stanima'});
    const snowLeopardStanimaBarFill = snowLeopardStanimaBar.querySelector('div');
    const tigerHealthBar = screen.getByRole('progressbar', {name: 'Tiger fighter health'});
    const snowLeopardHealthBar = screen.getByRole('progressbar', {name: 'Snow leopard fighter health'});

    expect(tigerStanimaBar).toHaveClass(css.fightStaminaBar);
    expect(tigerStanimaBarFill).toHaveClass(css.fill);
    expect(snowLeopardStanimaBar).toHaveClass(css.fightStaminaBar);
    expect(snowLeopardStanimaBarFill).toHaveClass(css.fill);
    expect(tigerHealthBar).toHaveClass(css.fightHealthBar);
    expect(snowLeopardHealthBar).toHaveClass(css.fightHealthBar);
    expect(tigerStanimaBar).not.toHaveAttribute('style');
    expect(snowLeopardStanimaBar).not.toHaveAttribute('style');
    expect(tigerHealthBar).not.toHaveAttribute('style');
    expect(snowLeopardHealthBar).not.toHaveAttribute('style');
  });

  it('shows the punch image and hides the regular attacker image when isPunching is true', () => {
    render(<FightFighters details={details} isPunching={true} />);

    const tigerImages = screen.getAllByAltText('Tiger Muay Thai fighter');
    const mainImage = tigerImages.find((img) => img.classList.contains(css.fightFighterImage));
    const punchImage = tigerImages.find((img) => img.classList.contains(css.fightFighterImagePunch));

    expect(mainImage).toHaveAttribute('aria-hidden', 'true');
    expect(punchImage).not.toHaveAttribute('aria-hidden');
    expect(punchImage).toHaveClass(css.fightFighterImagePunchVisible);
  });
});
