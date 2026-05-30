import {render, screen} from '@testing-library/react';

import css from './css-modules/stat-list-base.module.css';
import StatList from './StatList.js';


describe('StatList', () => {
  it('applies shared stat list class and custom class names', () => {
    render(<StatList className="extra"><span>Item</span></StatList>);

    expect(screen.getByText('Item').parentElement).toHaveClass(css.statListBase, 'extra');
  });

  it('renders custom element types via the as prop', () => {
    render(<StatList as="dl"><dt>Name</dt></StatList>);

    expect(screen.getByRole('term').closest('dl')).toBeInTheDocument();
  });
});
