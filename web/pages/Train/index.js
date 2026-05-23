import {SKILL_IDS} from 'shared/skills.js';
import Button from '@/components/Button.js';
import useFighterActionsStore from '@/data/fighterActions.js';
import useFighterStore from '@/data/fighter.js';

import Skills from './Skills.js';
import {isActionEnabled, onActionButtonClick} from './skillButtons.js';
import TrainStat from './TrainStat.js';

import css from './Train.module.css';

const STAT_FIELDS = [
  {name: 'Agility', stat: 'agility'},
  {name: 'Strength', stat: 'strength'},
  {name: 'Constitution', stat: 'constitution'},
  {name: 'Skill', stat: 'skill'},
  {name: 'Stanima', stat: 'stamina'},
];

export default function Train() {
  const fighter = useFighterStore();

  return (
    <>
      <h1>Training</h1>
      <section className={css.section}>
        <div className={css.stats}>{STAT_FIELDS.map(({name, stat}) => <TrainStat key={stat} name={name} stat={stat} />)}</div>
      </section>
      <section className={css.section}>
        <RegimenRows fighter={fighter} />
      </section>
    </>
  );
}

function RegimenRows({fighter}) {
  const {actions} = useFighterActionsStore();
  return (
    <div className={css.regimen}>
      {Object.keys(Skills)
        .filter((skillKey) => Skills[skillKey].requires(fighter))
        .map((skillKey) => (
          <RegimenRow
            actionEnabled={isActionEnabled(actions, skillKey)}
            key={skillKey}
            name={Skills[skillKey].name}
            progress={actions.find((a) => a.action_id === SKILL_IDS[skillKey])?.progress || 0}
            skillKey={skillKey}
          />
        ))}
    </div>
  );
}

function RegimenRow({actionEnabled, name, progress, skillKey}) {
  return (
    <div className={css.regimenRow}>
      <div>{name}</div>
      <div className={css.regimenProgress}>
        <RegimenProgress actionEnabled={actionEnabled} name={name} progress={progress} />
        <Button
          className={actionEnabled ? css.idleActive : ''}
          onClick={() => onActionButtonClick({actionEnabled, skillKey})}
        >
          {actionEnabled ? 'STOP' : 'IDLE'}
        </Button>
      </div>
    </div>
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
        className={actionEnabled ? css.regimenProgressTrack : `${css.regimenProgressTrack} ${css.regimenProgressTrackDisabled}`}
        role="progressbar"
      >
        <div className={css.regimenProgressFill} style={{width: `${progress}%`}} />
      </div>
      <span className={css.regimenProgressLabel}>{`${progress}%`}</span>
    </>
  );
}
