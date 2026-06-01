import Section from '@/components/primitive/Section.js';

import ActiveFight from '../ActiveFight/index.js';
import css from './FightForGlory.module.css';


export default function FightForGlory() {
  return (
    <Section className={css.glorySection}>
      <h2>Fight for Glory</h2>
      <ActiveFight />
    </Section>
  );
}
