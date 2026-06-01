import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import FightFeed from './FightFeed.js';
import css from '../Fight.module.css';


describe('FightFeed', () => {
  it('applies attacker classes based on whether the attacker is self', () => {
    render(<FightFeed />);

    for(const attacker of screen.getAllByText('Tiger')) {
      expect(attacker).toHaveClass(css.fightFeedAttackerSelf);
    }
    for(const attacker of screen.getAllByText('Snow Leopard')) {
      expect(attacker).toHaveClass(css.fightFeedAttackerEnemy);
    }
  });
});
