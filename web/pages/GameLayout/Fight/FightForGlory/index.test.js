import {render, screen} from '@testing-library/react';

import sectionCss from '@/components/primitive/Section.module.css';

import css from './FightForGlory.module.css';
import FightForGlory from './index.js';


describe('FightForGlory', () => {
  it('applies section styles from its own css module', () => {
    render(<FightForGlory />);

    const section = screen.getByRole('heading', {name: 'Fight for Glory'}).closest('section');

    expect(section).toHaveClass(sectionCss.section, css.glorySection);
  });
});
