import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import FightFeed from './FightFeed.js';

describe('FightFeed', () => {
  it('renders no feed entries when details are missing', () => {
    render(<FightFeed />);

    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });

  it('renders server feed entries with newest first', () => {
    render(
      <FightFeed
        details={{
          feed: [
            {attacker: 'Tiger', isSelf: true, move: 'Hook', result: 'Lands for 12!'},
            {attacker: 'Snow Leopard', isSelf: false, move: 'Knee', result: 'Lands for 9!'},
          ],
        }}
      />,
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Snow Leopard throws Knee — Lands for 9!');
    expect(items[1]).toHaveTextContent('Tiger throws Hook — Lands for 12!');
  });
});
