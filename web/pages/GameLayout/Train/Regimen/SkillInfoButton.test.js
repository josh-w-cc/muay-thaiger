import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SkillInfoButton from './SkillInfoButton.js';
import css from './SkillInfoButton.module.css';


function SkillInfoButtonWrapper() {
  const [tooltipOpen, setTooltipOpen] = React.useState(false);

  return (
    <SkillInfoButton
      description="Keep your guard up."
      duration={30}
      name="Defense"
      setTooltipOpen={setTooltipOpen}
      tooltipID="skill-tooltip-defense"
      tooltipOpen={tooltipOpen}
    />
  );
}

describe('SkillInfoButton', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uses its own CSS module for the button and tooltip', () => {
    render(
      <SkillInfoButton
        description="Keep your guard up."
        duration={30}
        name="Defense"
        setTooltipOpen={vi.fn()}
        tooltipID="skill-tooltip-defense"
        tooltipOpen
      />,
    );

    expect(screen.getByRole('button', {name: 'Defense info'})).toHaveClass(css.infoButton);
    expect(screen.getByRole('tooltip')).toHaveClass(css.infoTooltip);
  });

  it('shows and hides the tooltip on hover', async () => {
    const user = userEvent.setup();

    render(<SkillInfoButtonWrapper />);

    const button = screen.getByRole('button', {name: 'Defense info'});

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await user.hover(button);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Keep your guard up. (30s)');

    await user.unhover(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
