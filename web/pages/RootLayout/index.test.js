import {render, screen} from '@testing-library/react';

vi.mock('react-router', () => ({
  Outlet: () => <div data-testid="outlet" />,
}));

describe('RootLayout', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders outlet', async () => {
    const {default: RootLayout} = await import('./index.js');
    render(<RootLayout />);
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });
});
