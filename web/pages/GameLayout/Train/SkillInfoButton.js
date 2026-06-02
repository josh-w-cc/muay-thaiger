import {BsInfoCircle} from 'react-icons/bs';

import css from './Train.module.css';

export default function SkillInfoButton({description, duration, name, setTooltipOpen, tooltipID, tooltipOpen}) {
  const tooltipText = `${description} (${duration}s)`;

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
      <BsInfoCircle aria-hidden size={12} />
      {tooltipOpen && <span className={css.infoTooltip} id={tooltipID} role="tooltip">{tooltipText}</span>}
    </button>
  );
}
