import {render, screen} from '@testing-library/react';

import css from './VerticalList.module.css';


describe('VerticalList', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children inside a ul element by default', async () => {
    const {default: VerticalList} = await import('./VerticalList.js');
    render(<VerticalList><li>item</li></VerticalList>);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByText('item').closest('ul')).toBeInTheDocument();
  });

  it('renders children inside the specified element when as prop is given', async () => {
    const {default: VerticalList} = await import('./VerticalList.js');
    render(<VerticalList as="div"><span>content</span></VerticalList>);
    expect(screen.getByText('content').closest('div')).toBeInTheDocument();
  });

  it('applies base verticalList class', async () => {
    const {default: VerticalList} = await import('./VerticalList.js');
    render(<VerticalList><li>item</li></VerticalList>);
    expect(screen.getByRole('list')).toHaveClass(css.verticalList);
  });

  it('merges extra className with base class', async () => {
    const {default: VerticalList} = await import('./VerticalList.js');
    render(<VerticalList className="extra"><li>item</li></VerticalList>);
    expect(screen.getByRole('list')).toHaveClass(css.verticalList, 'extra');
  });
});
