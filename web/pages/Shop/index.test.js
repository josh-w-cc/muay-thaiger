import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Shop from './index.js';


const {buy, fighter} = vi.hoisted(() => ({
  buy: vi.fn(),
  fighter: {id: 1},
}));

vi.mock('@/data/fighter.js', () => ({
  default: () => fighter,
}));

vi.mock('@/data/inventory.js', () => ({
  default: (selector) => selector({buy}),
}));

describe('Shop', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders items and buys the selected one', async () => {
    const user = userEvent.setup();
    const {container} = render(<Shop />);

    const buyButtons = screen.getAllByRole('button', {name: 'Buy'});
    const section = container.querySelector('section');

    expect(buyButtons).toHaveLength(2);
    expect(section).toBeInTheDocument();
    await user.click(buyButtons[0]);

    expect(buy).toHaveBeenCalledTimes(1);
    expect(buy).toHaveBeenCalledWith(fighter, expect.objectContaining({name: 'Food'}));
  });
});
