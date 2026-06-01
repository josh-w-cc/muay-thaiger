import {SKILL_IDS} from 'shared/skills.js';
import useFighterActionsStore from '@/data/fighterActions.js';

import Skills from './Skills.js';
import RegimenRow from './RegimenRow.js';
import {isActionEnabled} from './skillButtons.js';

import css from './Train.module.css';

export default function RegimenRows({fighter}) {
  const {actions} = useFighterActionsStore();
  const skillKeys = Object.keys(Skills).filter((skillKey) => Skills[skillKey].requires(fighter));

  return (
    <div className={css.regimen}>
      {skillKeys.map((skillKey) => (
        <RegimenRow
          actionEnabled={isActionEnabled(actions, skillKey)}
          key={skillKey}
          progress={actions.find((a) => a.action === SKILL_IDS[skillKey])?.progress || 0}
          skill={Skills[skillKey]}
          skillKey={skillKey}
        />
      ))}
    </div>
  );
}
