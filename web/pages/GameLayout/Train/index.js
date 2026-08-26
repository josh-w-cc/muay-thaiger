import Section from '@/components/primitive/Section.js';
import useFighterStore from '@/data/fighter/index.js';

import Regimen from './Regimen/index.js';
import Stats from './Stats.js';

export default function Train() {
  const fighter = useFighterStore();

  return (
    <>
      <Section>
        <Stats />
      </Section>
      <Section>
        <Regimen fighter={fighter} />
      </Section>
    </>
  );
}
