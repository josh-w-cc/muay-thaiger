import SkillInfoButton from './SkillInfoButton.js';

import css from '../Train.module.css';

export default function RegimenName({setTooltipOpen, skill, skillKey, tooltipOpen}) {
  return (
    <div className={css.regimenName}>
      <span onMouseEnter={() => setTooltipOpen(true)} onMouseLeave={() => setTooltipOpen(false)}>{skill.name}</span>
      <SkillInfoButton
        description={skill.description}
        duration={skill.duration}
        name={skill.name}
        setTooltipOpen={setTooltipOpen}
        tooltipID={`skill-tooltip-${skillKey}`}
        tooltipOpen={tooltipOpen}
      />
    </div>
  );
}
