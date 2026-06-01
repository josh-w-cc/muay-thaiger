import useFighterStore from '@/data/fighter.js';
import useFightStore, {FIGHT_IN_PROGRESS, FIGHT_NOT_STARTED, FIGHT_LOST, FIGHT_WON} from '@/data/fight.js';
import Section from '@/components/primitive/Section.js';

import FightForGlory from './FightForGlory/index.js';
import FightInProgress from './FightInProgress.js';
import FightNotStarted from './FightNotStarted.js';
import FightOver from './FightOver.js';
import ZerothFight, {needsZerothFight} from './ZerothFight.js';


export default function FightMenu() {
  const fight = useFightStore();
  const fighter = useFighterStore();

  if(needsZerothFight(fighter)) {
    return (<ZerothFight />);
  }

  let content;
  if(fight.state === FIGHT_NOT_STARTED) {
    content = <FightNotStarted />;
  }
  else if(fight.state === FIGHT_IN_PROGRESS) {
    content = <FightInProgress />;
  }
  else if(fight.state === FIGHT_WON || fight.state === FIGHT_LOST) {
    content = <FightOver />;
  }

  return (
    <>
      <Section>
        <h1>Fight for ฿</h1>
        {content}
        {fight.messages.slice().reverse()}
      </Section>
      <FightForGlory />
    </>
  );
}
