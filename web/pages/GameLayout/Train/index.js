import Section from '@/components/primitive/Section.js';
import useFighterStore from '@/data/fighter.js';

import RegimenRows from './regimens/RegimenRows.js';
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
        <div className={css.stats}>{STAT_FIELDS.map(({name, stat}) => <TrainStat key={stat} name={name} stat={stat} />)}</div>
      </Section>
      <Section>
        <RegimenRows fighter={fighter} />
      </Section>
    </>
  );
}
