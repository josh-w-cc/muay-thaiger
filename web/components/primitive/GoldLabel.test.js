import {render, screen} from '@testing-library/react';

import GoldLabel from './GoldLabel.js';
import css from './GoldLabel.module.css';


describe('GoldLabel', () => {
  it('renders children inside a span', () => {
    render(<GoldLabel>Tournament Win</GoldLabel>);

    expect(screen.getByText('Tournament Win').tagName).toBe('SPAN');
  });

  it('applies base gold label class', () => {
    render(<GoldLabel>Tournament Win</GoldLabel>);

    expect(screen.getByText('Tournament Win')).toHaveClass(css.goldLabel);
  });

  it('merges extra className with base class', () => {
    render(<GoldLabel className="extra">Tournament Win</GoldLabel>);

    expect(screen.getByText('Tournament Win')).toHaveClass(css.goldLabel, 'extra');
  });
});
