import {render, screen} from '@testing-library/react';

import css from './GoldLabel.module.css';


describe('GoldLabel', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children inside a span element by default', async () => {
    const {default: GoldLabel} = await import('./GoldLabel.js');
    render(<GoldLabel>Win</GoldLabel>);
    expect(screen.getByText('Win')).toBeInTheDocument();
    expect(screen.getByText('Win').tagName).toBe('SPAN');
  });

  it('renders children inside the specified element when as prop is given', async () => {
    const {default: GoldLabel} = await import('./GoldLabel.js');
    render(
      <table>
        <thead>
          <tr>
            <GoldLabel as="th">Header</GoldLabel>
          </tr>
        </thead>
      </table>,
    );
    expect(screen.getByRole('columnheader', {name: 'Header'})).toBeInTheDocument();
  });

  it('applies base goldLabel class', async () => {
    const {default: GoldLabel} = await import('./GoldLabel.js');
    render(<GoldLabel>Win</GoldLabel>);
    expect(screen.getByText('Win')).toHaveClass(css.goldLabel);
  });

  it('merges extra className with base class', async () => {
    const {default: GoldLabel} = await import('./GoldLabel.js');
    render(<GoldLabel className="extra">Win</GoldLabel>);
    expect(screen.getByText('Win')).toHaveClass(css.goldLabel, 'extra');
  });
});
