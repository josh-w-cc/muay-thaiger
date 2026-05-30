import cx from 'classnames';
import {SKILL_IDS} from 'shared/skills.js';
import Button from '@/components/Button.js';
import Section from '@/components/primitive/Section.js';
import StatList from '@/components/primitive/StatList.js';
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
      <Section>
        <StatList>{STAT_FIELDS.map(({name, stat}) => <TrainStat key={stat} name={name} stat={stat} />)}</StatList>
      </Section>
      <Section>
        <RegimenRows fighter={fighter} />
      </Section>
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
            progress={actions.find((a) => a.action === SKILL_IDS[skillKey])?.progress || 0}
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
          className={cx(css.actionButton, {
            [css.idleActive]: actionEnabled,
          })}
          onClick={() => onActionButtonClick({actionEnabled, skillKey})}
        >
          {actionEnabled ? 'STOP' : 'IDLE'}
        </Button>
      </div>
    </div>
  );
}

function RegimenProgress({actionEnabled, name, progress}) {
  const progressTrackClassName = cx(css.regimenProgressTrack, {[css.regimenProgressTrackDisabled]: !actionEnabled});
  const progressLabelClassName = cx(css.regimenProgressLabel, {[css.regimenProgressLabelDisabled]: !actionEnabled});

  return (
    <>
      <div
        aria-label={`${name} completion`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        className={progressTrackClassName}
        role="progressbar"
      >
        <div className={css.regimenProgressFill} style={{width: `${progress}%`}} />
      </div>
      <span className={progressLabelClassName}>{`${progress}%`}</span>
    </>
  );
}
