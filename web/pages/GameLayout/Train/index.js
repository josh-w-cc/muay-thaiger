import Section from '@/components/primitive/Section.js';
import VerticalList from '@/components/primitive/VerticalList.js';
import useFighterStore from '@/data/fighter.js';

import Regimen from './Regimen/index.js';
import TrainStat from './TrainStat.js';

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
        <VerticalList as="div">{STAT_FIELDS.map(({name, stat}) => <TrainStat key={stat} name={name} stat={stat} />)}</VerticalList>
      </Section>
      <Section>
        <Regimen fighter={fighter} />
      </Section>
    </>
  );
}
