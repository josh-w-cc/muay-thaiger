import {render, screen} from '@testing-library/react';

import css from './StatRow.module.css';


describe('StatRow', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders label and value text', async () => {
    const {default: StatRow} = await import('./StatRow.js');
    render(<StatRow label="Attack" value="42" />);
    expect(screen.getByText('Attack')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('applies row class to container', async () => {
    const {default: StatRow} = await import('./StatRow.js');
    const {container} = render(<StatRow label="Attack" value="42" />);
    expect(container.firstChild).toHaveClass(css.row);
  });

  it('applies label and value classes', async () => {
    const {default: StatRow} = await import('./StatRow.js');
    render(<StatRow label="Attack" value="42" />);
    expect(screen.getByText('Attack')).toHaveClass(css.label);
    expect(screen.getByText('42')).toHaveClass(css.value);
  });
});
