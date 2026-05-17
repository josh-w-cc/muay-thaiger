import {render, screen} from '@testing-library/react';

import NotFound from './NotFound.js';


describe('NotFound', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders a 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading')).toHaveTextContent('404');
  });
});
