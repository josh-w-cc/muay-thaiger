import {render, screen} from '@testing-library/react';

import css from './StatRow.module.css';


describe('StatRow', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders label and value', async () => {
    const {default: StatRow} = await import('./StatRow.js');
    render(<StatRow label="Strength" value="100" />);
    expect(screen.getByText('Strength')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('applies base statRow class to the wrapper', async () => {
    const {default: StatRow} = await import('./StatRow.js');
    render(<StatRow label="Strength" value="100" />);
    expect(screen.getByText('Strength').closest('div')).toHaveClass(css.statRow);
  });

  it('applies label and value classes', async () => {
    const {default: StatRow} = await import('./StatRow.js');
    render(<StatRow label="Strength" value="100" />);
    expect(screen.getByText('Strength')).toHaveClass(css.label);
    expect(screen.getByText('100')).toHaveClass(css.value);
  });

  it('merges extra className with base class', async () => {
    const {default: StatRow} = await import('./StatRow.js');
    render(<StatRow className="extra" label="Strength" value="100" />);
    expect(screen.getByText('Strength').closest('div')).toHaveClass(css.statRow, 'extra');
  });
});
