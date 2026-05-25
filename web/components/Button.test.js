import {render, screen} from '@testing-library/react';

import Button from './Button.js';
import css from './Button.module.css';


describe('Button', () => {
  it('applies base and custom classes', () => {
    render(<Button className="custom-class">Click me</Button>);

    expect(screen.getByRole('button', {name: 'Click me'})).toHaveClass(css.button, 'custom-class');
  });
});
