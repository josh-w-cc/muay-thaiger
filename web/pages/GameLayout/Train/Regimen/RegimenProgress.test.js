import {render, screen} from '@testing-library/react';

import RegimenProgress from './RegimenProgress.js';
import css from './RegimenProgress.module.css';


describe('RegimenProgress', () => {
  it('uses its own CSS module classes', () => {
    const {rerender} = render(<RegimenProgress actionEnabled name="Defense" progress={40} />);

    expect(screen.getByRole('progressbar', {name: 'Defense completion'})).toHaveClass(css.regimenProgressTrack);
    expect(screen.getByText('40%')).toHaveClass(css.regimenProgressLabel);

    rerender(<RegimenProgress actionEnabled={false} name="Defense" progress={40} />);

    expect(screen.getByRole('progressbar', {name: 'Defense completion'})).toHaveClass(css.regimenProgressTrackDisabled);
    expect(screen.getByText('40%')).toHaveClass(css.regimenProgressLabelDisabled);
  });
});
