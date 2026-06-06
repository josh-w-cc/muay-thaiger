import {render, screen, within} from '@testing-library/react';

import FighterDetails from '../FighterDetails.js';


const fighter = vi.hoisted(() => ({
  createdAt: new Date(Date.now() - 7200000).toISOString(),
  displayName: 'Iron Tiger',
  race: '1',
}));

vi.mock('@/data/fighter.js', () => ({
  default: () => fighter,
}));

describe('FighterDetails', () => {
  it('renders fighter name, age, and race when all data is present', () => {
    render(<FighterDetails />);

    expect(within(screen.getByText('Name').closest('div')).getByText('Iron Tiger')).toBeInTheDocument();
    expect(within(screen.getByText('Race').closest('div')).getByText('Tiger')).toBeInTheDocument();
    expect(within(screen.getByText('Age').closest('div')).getByText('2h')).toBeInTheDocument();
  });

  it('renders Age last in the details list', () => {
    render(<FighterDetails />);

    const items = screen.getAllByRole('term');

    expect(items[items.length - 1]).toHaveTextContent('Age');
  });

  it('shows 0h for a newly-created fighter with a future createdAt', () => {
    const original = {...fighter};

    fighter.createdAt = new Date(Date.now() + 5000).toISOString();

    render(<FighterDetails />);

    expect(within(screen.getByText('Age').closest('div')).getByText('0h')).toBeInTheDocument();

    Object.assign(fighter, original);
  });

  it('shows dashes when createdAt, displayName, and race are absent', () => {
    const original = {...fighter};

    fighter.createdAt = null;
    fighter.displayName = '';
    fighter.race = 'unknown';

    render(<FighterDetails />);

    const nameDashes = within(screen.getByText('Name').closest('div')).getAllByText('—');

    expect(nameDashes.length).toBeGreaterThan(0);
    const ageDashes = within(screen.getByText('Age').closest('div')).getAllByText('—');

    expect(ageDashes.length).toBeGreaterThan(0);
    const raceDashes = within(screen.getByText('Race').closest('div')).getAllByText('—');

    expect(raceDashes.length).toBeGreaterThan(0);

    Object.assign(fighter, original);
  });
});
