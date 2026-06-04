import {render, screen} from '@testing-library/react';

import RegimenActionButton from './RegimenActionButton.js';
import css from './RegimenActionButton.module.css';


describe('RegimenActionButton', () => {
  it('uses its own CSS module classes', () => {
    const {rerender} = render(<RegimenActionButton actionEnabled={false} skillKey="teep" />);

    expect(screen.getByRole('button', {name: 'IDLE'})).toHaveClass(css.actionButton);
    expect(screen.getByRole('button', {name: 'IDLE'})).not.toHaveClass(css.idleActive);

    rerender(<RegimenActionButton actionEnabled skillKey="teep" />);

    expect(screen.getByRole('button', {name: 'STOP'})).toHaveClass(css.actionButton, css.idleActive);
  });
});
