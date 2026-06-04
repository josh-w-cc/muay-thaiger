import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ServerDown from './ServerDown.js';


describe('ServerDown', () => {
  const originalLocation = globalThis.window.location;

  afterEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(globalThis.window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('renders a server unavailable heading', () => {
    render(<ServerDown />);
    expect(screen.getByRole('heading')).toHaveTextContent('Server Unavailable');
  });

  it('renders a return home button', () => {
    render(<ServerDown />);
    expect(screen.getByRole('button', {name: /return home/i})).toBeInTheDocument();
  });

  it('navigates home with a hard reload when the return home button is clicked', async () => {
    Object.defineProperty(globalThis.window, 'location', {
      configurable: true,
      value: {href: 'http://localhost/server-down'},
      writable: true,
    });
    render(<ServerDown />);

    await userEvent.click(screen.getByRole('button', {name: /return home/i}));

    expect(globalThis.window.location.href).toBe('/');
  });
});
