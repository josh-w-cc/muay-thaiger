import {render, screen} from '@testing-library/react';

vi.mock('./App.js', () => ({
  default: () => <div data-testid="dashboard-app" />,
}));


describe('Dashboard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard app', async () => {
    const {default: Dashboard} = await import('./index.js');
    render(<Dashboard />);
    expect(screen.getByTestId('dashboard-app')).toBeInTheDocument();
  });

  it('loader returns null', async () => {
    const {loader} = await import('./index.js');
    expect(loader()).toBeNull();
  });
});
