import {render, screen} from '@testing-library/react';

import Dashboard, {loader} from './index.js';


describe('Dashboard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a heading', () => {
    render(<Dashboard />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('loader returns null', () => {
    expect(loader()).toBeNull();
  });
});
