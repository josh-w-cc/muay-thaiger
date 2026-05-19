import Button from '@/components/Button.js';
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

export default function Train() {
  const fighter = useFighterStore();

  return (
    <>
      <h1>Training</h1>
      <h3>Stats:</h3>
      <div className={css.stats}>
        {STAT_FIELDS.map(({name, stat}) => <TrainStat key={stat} name={name} stat={stat} />)}
      </div>
      <h3>Skills:</h3>
      <SkillRows fighter={fighter} />
    </>
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
        onClick={() => fighter.idle(`train-${skillKey}`, () => skill.action(fighter))}
      >
        Idle
      </Button>
    </div>
  );
}
