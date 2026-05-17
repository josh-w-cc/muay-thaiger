import {render, screen} from '@testing-library/react';

import Dashboard, {loader} from './index.js';


describe('Dashboard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders orig content', () => {
    render(<Dashboard />);
    expect(screen.getByRole('heading', {name: 'Choose your fighter:'})).toBeInTheDocument();
  });

  it('loader returns null', () => {
    expect(loader()).toBeNull();
  });
});
