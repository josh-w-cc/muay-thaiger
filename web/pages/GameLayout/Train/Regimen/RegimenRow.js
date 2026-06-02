import {useState} from 'react';

import RegimenActionButton from './RegimenActionButton.js';
import RegimenName from './RegimenName.js';
import RegimenProgress from './RegimenProgress.js';

import css from '../Train.module.css';

export default function RegimenRow({actionEnabled, progress, skill, skillKey}) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <div className={css.regimenRow}>
      <RegimenName setTooltipOpen={setTooltipOpen} skill={skill} skillKey={skillKey} tooltipOpen={tooltipOpen} />
      <div className={css.regimenProgress}>
        <RegimenProgress actionEnabled={actionEnabled} name={skill.name} progress={progress} />
        <RegimenActionButton actionEnabled={actionEnabled} skillKey={skillKey} />
      </div>
    </div>
  );
}
