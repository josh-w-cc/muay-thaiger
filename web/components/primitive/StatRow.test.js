import {render, screen} from '@testing-library/react';

import StatRow from './StatRow.js';
import css from './StatRow.module.css';


describe('StatRow', () => {
  it('renders label and value', () => {
    render(<dl><StatRow label="Strength" value="42" /></dl>);

    expect(screen.getByRole('term')).toHaveTextContent('Strength');
    expect(screen.getByRole('definition')).toHaveTextContent('42');
  });

  it('applies base classes', () => {
    render(<dl><StatRow label="Strength" value="42" /></dl>);

    expect(screen.getByRole('term')).toHaveClass(css.label);
    expect(screen.getByRole('definition')).toHaveClass(css.value);
    expect(screen.getByRole('term').closest('div')).toHaveClass(css.statRow);
  });
});
