import {render, screen, within} from '@testing-library/react';

import FighterDetails from './FighterDetails.js';

describe('FighterDetails', () => {
  it('renders fighter name, age, and race when all data is present', () => {
    const fighter = {
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      displayName: 'Iron Tiger',
      race: '1',
    };

    render(<FighterDetails fighter={fighter} />);

    expect(within(screen.getByText('Name').closest('div')).getByText('Iron Tiger')).toBeInTheDocument();
    expect(within(screen.getByText('Race').closest('div')).getByText('Tiger')).toBeInTheDocument();
    expect(within(screen.getByText('Age').closest('div')).getByText('2h')).toBeInTheDocument();
  });

  it('shows dashes when createdAt, displayName, and race are absent', () => {
    const fighter = {
      createdAt: null,
      displayName: '',
      race: 'unknown',
    };

    render(<FighterDetails fighter={fighter} />);

    const nameDashes = within(screen.getByText('Name').closest('div')).getAllByText('—');
    expect(nameDashes.length).toBeGreaterThan(0);
    const ageDashes = within(screen.getByText('Age').closest('div')).getAllByText('—');
    expect(ageDashes.length).toBeGreaterThan(0);
    const raceDashes = within(screen.getByText('Race').closest('div')).getAllByText('—');
    expect(raceDashes.length).toBeGreaterThan(0);
  });
});
