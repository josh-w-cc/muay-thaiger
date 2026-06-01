import React from 'react';
import cx from 'classnames';
import {FaCircleInfo} from 'react-icons/fa6';
import Button from '@/components/Button.js';

import {onActionButtonClick} from './skillButtons.js';

import css from './Train.module.css';

export default function RegimenRow({actionEnabled, progress, skill, skillKey}) {
  return (
    <div className={css.regimenRow}>
      <div className={css.regimenName}>
        {skill.name}
        <SkillInfoButton description={skill.description} duration={skill.duration} name={skill.name} skillKey={skillKey} />
      </div>
      <div className={css.regimenProgress}>
        <RegimenProgress actionEnabled={actionEnabled} name={skill.name} progress={progress} />
        <Button className={cx(css.actionButton, {[css.idleActive]: actionEnabled})} onClick={() => onActionButtonClick({actionEnabled, skillKey})}>
          {actionEnabled ? 'STOP' : 'IDLE'}
        </Button>
      </div>
    </div>
  );
}

function SkillInfoButton({description, duration, name, skillKey}) {
  const [tooltipOpen, setTooltipOpen] = React.useState(false);
  const tooltipID = `skill-tooltip-${skillKey}`;
  const durationText = Number.isFinite(duration) ? ` (${duration}s)` : '';

  return (
    <button
      aria-describedby={tooltipOpen ? tooltipID : undefined}
      aria-expanded={tooltipOpen}
      aria-label={`${name} info`}
      className={css.infoButton}
      onClick={() => setTooltipOpen((isOpen) => !isOpen)}
      onMouseEnter={() => setTooltipOpen(true)}
      onMouseLeave={() => setTooltipOpen(false)}
      type="button"
    >
      <FaCircleInfo aria-hidden size={12} />
      {tooltipOpen && <SkillTooltip description={description} durationText={durationText} tooltipID={tooltipID} />}
    </button>
  );
}

function SkillTooltip({description, durationText, tooltipID}) {
  return (
    <span className={css.infoTooltip} id={tooltipID} role="tooltip">
      {description}
      {durationText}
    </span>
  );
}

function RegimenProgress({actionEnabled, name, progress}) {
  return (
    <>
      <div
        aria-label={`${name} completion`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        className={cx(css.regimenProgressTrack, {[css.regimenProgressTrackDisabled]: !actionEnabled})}
        role="progressbar"
      >
        <div className={css.regimenProgressFill} style={{width: `${progress}%`}} />
      </div>
      <span className={cx(css.regimenProgressLabel, {[css.regimenProgressLabelDisabled]: !actionEnabled})}>{`${progress}%`}</span>
    </>
  );
}
