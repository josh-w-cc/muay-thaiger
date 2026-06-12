import {render, screen} from '@testing-library/react';
import {describe, expect, it, afterEach} from 'vitest';
import useFightStore, {resetFightStore} from '@/data/fight.js';

import FightFeed from './FightFeed.js';

describe('FightFeed', () => {
  afterEach(() => {
    resetFightStore();
  });

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
    expect(items[0].querySelector('br')).toBeInTheDocument();
    expect(items[1].querySelector('br')).toBeInTheDocument();
  });

  it('renders pending feed items above server feed items with no damage value', () => {
    useFightStore.getState().syncServerState({
      details: {
        attacker: {name: 'Tiger', startingStats: {}, stats: {}},
      },
      id: 1,
      reason: 'gold',
    });
    useFightStore.getState().addPendingFeedItem('Cross');

    render(
      <FightFeed
        details={{
          feed: [
            {attacker: 'Snow Leopard', isSelf: false, move: 'Knee', result: 'Lands for 9!'},
          ],
        }}
      />,
    );

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Tiger throws Cross');
    expect(items[0].querySelector('br')).not.toBeInTheDocument();
    expect(items[0]).not.toHaveTextContent('—');
    expect(items[1]).toHaveTextContent('Snow Leopard throws Knee — Lands for 9!');
    expect(items[1].querySelector('br')).toBeInTheDocument();
  });

  it('renders multiple pending items in reverse click order', () => {
    useFightStore.getState().syncServerState({
      details: {
        attacker: {name: 'Tiger', startingStats: {}, stats: {}},
      },
      id: 1,
      reason: 'gold',
    });
    useFightStore.getState().addPendingFeedItem('Jab');
    useFightStore.getState().addPendingFeedItem('Cross');

    render(<FightFeed details={{}} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Tiger throws Cross');
    expect(items[1]).toHaveTextContent('Tiger throws Jab');
  });

  it('keeps existing server items mounted when a new item is added', () => {
    const {rerender} = render(
      <FightFeed
        details={{
          feed: [
            {attacker: 'Tiger', isSelf: true, move: 'Hook', result: 'Lands for 12!'},
            {attacker: 'Snow Leopard', isSelf: false, move: 'Knee', result: 'Lands for 9!'},
          ],
        }}
      />,
    );

    const initialItems = screen.getAllByRole('listitem');

    rerender(
      <FightFeed
        details={{
          feed: [
            {attacker: 'Tiger', isSelf: true, move: 'Hook', result: 'Lands for 12!'},
            {attacker: 'Snow Leopard', isSelf: false, move: 'Knee', result: 'Lands for 9!'},
            {attacker: 'Tiger', isSelf: true, move: 'Elbow', result: 'Lands for 14!'},
          ],
        }}
      />,
    );

    const updatedItems = screen.getAllByRole('listitem');
    expect(updatedItems[1]).toBe(initialItems[0]);
    expect(updatedItems[2]).toBe(initialItems[1]);
  });
});
