import Section from '@/components/primitive/Section.js';

import FightForGloryFeed from './FightForGloryFeed.js';
import FightForGloryFighters from './FightForGloryFighters.js';
import FightForGloryLoadout from './FightForGloryLoadout.js';
import css from '../Fight.module.css';


export default function FightForGlory() {
  return (
    <Section className={css.glorySection}>
      <h2>Fight for Glory</h2>
      <ActiveFight />
    </Section>
  );
}

function ActiveFight() {
  return <>
    <FightForGloryLoadout/>
    <FightForGloryFighters/>
    <FightForGloryFeed/>
  </>;
}
