import {render, screen} from '@testing-library/react';


describe('Dashboard App', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders orig content', async () => {
    const {default: App} = await import('./App.js');
    render(<App />);
    expect(screen.getByRole('heading', {name: 'Choose your fighter:'})).toBeInTheDocument();
  });
});
