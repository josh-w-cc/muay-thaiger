import {SKILL_DEFINITIONS} from 'shared/skills/definitions.js';
import {SKILL_IDS} from 'shared/skills/ids.js';
import useFighterActionsStore from '@/data/fighter/fighterActions.js';

import RegimenRow from './RegimenRow.js';
import {isActionEnabled} from './skillButtons.js';

import css from './Regimen.module.css';

export default function Regimen({fighter}) {
  const {actions} = useFighterActionsStore();
  const skillKeys = Object.keys(SKILL_DEFINITIONS).filter((skillKey) => SKILL_DEFINITIONS[skillKey].requires(fighter));

  return (
    <div className={css.regimen}>
      {skillKeys.map((skillKey) => (
        <RegimenRow
          actionEnabled={isActionEnabled(actions, skillKey)}
          key={skillKey}
          progress={actions.find((a) => a.action === SKILL_IDS[skillKey])?.progress || 0}
          skill={SKILL_DEFINITIONS[skillKey]}
          skillKey={skillKey}
        />
      ))}
    </div>
  );
}
