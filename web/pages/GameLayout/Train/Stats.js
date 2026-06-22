import TrainStat from './TrainStat.js';

import css from './Stats.module.css';

const STAT_FIELDS = [
  {name: 'Agility', stat: 'agility'},
  {name: 'Strength', stat: 'strength'},
  {name: 'Constitution', stat: 'constitution'},
  {name: 'Skill', stat: 'skill'},
  {name: 'Stanima', stat: 'stamina'},
];

export default function Stats() {
  return (
    <div className={css.stats}>
      {STAT_FIELDS.map(({name, stat}) => <TrainStat key={stat} name={name} stat={stat} />)}
    </div>
  );
}
