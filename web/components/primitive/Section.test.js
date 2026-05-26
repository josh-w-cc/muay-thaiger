import {render, screen} from '@testing-library/react';

import css from './Section.module.css';


describe('Section', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children inside a section element', async () => {
    const {default: Section} = await import('./Section.js');
    render(<Section><span>content</span></Section>);
    expect(screen.getByText('content').closest('section')).toBeInTheDocument();
  });

  it('applies base section class', async () => {
    const {default: Section} = await import('./Section.js');
    render(<Section>content</Section>);
    expect(screen.getByText('content').closest('section')).toHaveClass(css.section);
  });

  it('merges extra className with base class', async () => {
    const {default: Section} = await import('./Section.js');
    render(<Section className="extra">content</Section>);
    const el = screen.getByText('content').closest('section');
    expect(el).toHaveClass(css.section, 'extra');
  });
});
