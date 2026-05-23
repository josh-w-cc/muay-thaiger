import Button from '@/components/Button.js';
import startIdle from '@/actions/startIdle.js';
import useFighterStore from '@/data/fighter.js';

import Skills from './Skills.js';
import TrainStat from './TrainStat.js';

import css from './Train.module.css';

const STAT_FIELDS = [
  {name: 'Agility', stat: 'agility'},
  {name: 'Strength', stat: 'strength'},
  {name: 'Constitution', stat: 'constitution'},
  {name: 'Skill', stat: 'skill'},
  {name: 'Stanima', stat: 'stamina'},
];
const CLINCH_ROUNDS_PROGRESS = 86;
const FOOTWORK_LADDER_PROGRESS = 34;
const PAD_WORK_PROGRESS = 61;
const TRAINING_REGIMEN = [
  {name: 'Footwork Ladder', progress: FOOTWORK_LADDER_PROGRESS},
  {name: 'Pad Work', progress: PAD_WORK_PROGRESS},
  {name: 'Clinch Rounds', progress: CLINCH_ROUNDS_PROGRESS},
];

export default function Train() {
  const fighter = useFighterStore();

  return (
    <>
      <h1>Training</h1>
      <section className={css.section}>
        <h3>Stats:</h3>
        <div className={css.stats}>{STAT_FIELDS.map(({name, stat}) => <TrainStat key={stat} name={name} stat={stat} />)}</div>
      </section>
      <section className={css.section}>
        <h3>Skills:</h3>
        <SkillRows fighter={fighter} />
      </section>
      <section className={css.section}>
        <h3>Training Regimen:</h3>
        <RegimenRows />
      </section>
    </>
  );
}

function RegimenRows() {
  return <div className={css.regimen}>{TRAINING_REGIMEN.map(({name, progress}) => <RegimenRow key={name} name={name} progress={progress} />)}</div>;
}

function RegimenRow({name, progress}) {
  return (
    <div className={css.regimenRow}>
      <div>{name}</div>
      <RegimenProgress name={name} progress={progress} />
    </div>
  );
}

function RegimenProgress({name, progress}) {
  return (
    <div className={css.regimenProgress}>
      <div
        aria-label={`${name} completion`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        className={css.regimenProgressTrack}
        role="progressbar"
      >
        <div className={css.regimenProgressFill} style={{width: `${progress}%`}} />
      </div>
      <span className={css.regimenProgressLabel}>{`${progress}%`}</span>
    </div>
  );
}

function SkillRows({fighter}) {
  return Object.keys(Skills)
    .filter((skillKey) => Skills[skillKey].requires(fighter))
    .map((skillKey) => <SkillRow fighter={fighter} key={skillKey} skillKey={skillKey} />);
}

function SkillRow({fighter, skillKey}) {
  const skill = Skills[skillKey];

  return (
    <div>
      {skill.name}
      <Button
        className={fighter.idling?.key === `train-${skillKey}` ? css.idleActive : ''}
        onClick={() => startIdle({fighter, skill, skillKey})}
      >
        Idle
      </Button>
    </div>
  );
}
