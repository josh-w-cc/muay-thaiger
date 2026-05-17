import {render, screen} from '@testing-library/react';

import App from './App.js';


describe('Dashboard App', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders orig content', () => {
    render(<App />);
    expect(screen.getByRole('heading', {name: 'Choose your fighter:'})).toBeInTheDocument();
  });
});
