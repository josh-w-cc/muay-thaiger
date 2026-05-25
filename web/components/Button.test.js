import {render, screen} from '@testing-library/react';

import Button from './Button.js';


describe('Button', () => {
  it('renders a button with its label', () => {
    render(<Button className="custom-class">Click me</Button>);

    expect(screen.getByRole('button', {name: 'Click me'})).toBeInTheDocument();
  });
});
