import {render, screen, within} from '@testing-library/react';

import Hub from './Hub.js';


const fighter = vi.hoisted(() => ({
  agility: 11,
  anima: 16,
  apm: 22,
  attack: 23,
  constitution: 19,
  defense: 24,
  durability: 17,
  gold: 2100,
  health: 25,
  innateStrength: 14,
  power: 26,
  reach: 18,
  skill: 20,
  speed: 12,
  stamina: 21,
  strength: 13,
  vitality: 15,
}));

vi.mock('@/orig/src/Fighter.js', () => ({
  default: () => fighter,
}));

describe('Hub', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders stats in a readable list layout', () => {
    const {container} = render(<Hub />);

    expect(container.querySelector('dl')).toBeInTheDocument();
    expect(container.querySelectorAll('dl > div')).toHaveLength(17);
    expect(container.querySelector('br')).not.toBeInTheDocument();
    const staminaRow = screen.getByText('Stanima').closest('div');

    expect(staminaRow).toBeInTheDocument();
    expect(within(staminaRow).getByText('21')).toBeInTheDocument();
  });
});
