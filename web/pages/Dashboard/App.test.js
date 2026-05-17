import {render, screen} from '@testing-library/react';

const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});


describe('Dashboard App', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('renders orig content', async () => {
    const {default: App} = await import('./App.js');
    render(<App />);
    expect(screen.getByRole('heading', {name: 'Choose your fighter:'})).toBeInTheDocument();
  });
});
