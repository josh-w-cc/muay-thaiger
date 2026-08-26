import {render, screen} from '@testing-library/react';

import css from './GoldLabel.module.css';


describe('GoldLabel', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children inside a span element', async () => {
    const {default: GoldLabel} = await import('./GoldLabel.js');
    render(<GoldLabel>Test Label</GoldLabel>);
    expect(screen.getByText('Test Label').tagName).toBe('SPAN');
  });

  it('applies base gold label class', async () => {
    const {default: GoldLabel} = await import('./GoldLabel.js');
    render(<GoldLabel>Test Label</GoldLabel>);
    expect(screen.getByText('Test Label')).toHaveClass(css.goldLabel);
  });

  it('merges extra className with base class', async () => {
    const {default: GoldLabel} = await import('./GoldLabel.js');
    render(<GoldLabel className="extra">Test Label</GoldLabel>);
    expect(screen.getByText('Test Label')).toHaveClass(css.goldLabel, 'extra');
  });
});
