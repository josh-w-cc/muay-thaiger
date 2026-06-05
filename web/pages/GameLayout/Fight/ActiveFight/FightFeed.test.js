import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import FightFeed from './FightFeed.js';

describe('FightFeed', () => {
  it('renders fallback feed when details are missing', () => {
    render(<FightFeed />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(12);
    expect(items[0]).toHaveTextContent('Tiger throws Jab — Lands for 18 damage!');
  });

  it('renders feed from server details when present', () => {
    render(
      <FightFeed
        details={{
          feed: [{attacker: 'Tiger', isSelf: true, move: 'Hook', result: 'Lands for 12!'}],
        }}
      />,
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Tiger throws Hook — Lands for 12!');
    expect(screen.queryByText('Lands for 18 damage!')).not.toBeInTheDocument();
  });
});
