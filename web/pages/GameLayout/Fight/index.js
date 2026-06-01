import useFighterStore from '@/data/fighter.js';
import useFightStore, {FIGHT_IN_PROGRESS, FIGHT_NOT_STARTED, FIGHT_LOST, FIGHT_WON} from '@/data/fight.js';
import {createFightCmd} from '@/actions/websockets/clientCommands.js';
import Button from '@/components/Button.js';
import Section from '@/components/primitive/Section.js';

import FightForGlory from './FightForGlory/index.js';
import ZerothFight, {needsZerothFight} from './ZerothFight.js';


export default function FightMenu() {
  const fight = useFightStore();
  const fighter = useFighterStore();

  if(needsZerothFight(fighter)) {
    return (<ZerothFight />);
  }

  let content;
  if(fight.state === FIGHT_NOT_STARTED) {
    content = (
      <>
        <Button onClick={() => createFightCmd()}>Fight!</Button>
      </>
    );
  }
  else if(fight.state === FIGHT_IN_PROGRESS) {
    const [you, them] = fight.fighters;
    content = (
      <>
        <h3>Enemy Stats:</h3>
        APM:
        {' '}
        {them.stats.apm.toFormattedNumber()}
        <br />
        Attack:
        {' '}
        {them.stats.attack.toFormattedNumber()}
        <br />
        Defense:
        {' '}
        {them.stats.defense.toFormattedNumber()}
        <br />
        Health:
        {' '}
        {them.stats.health.toFormattedNumber()}
        <br />
        Power:
        {' '}
        {them.stats.power.toFormattedNumber()}
        <br />
        Stanima:
        {' '}
        {them.stats.stamina.toFormattedNumber()}
        <br />
        Health:
        {' '}
        {them.currentHealth.toFormattedNumber()}
        <h3>Stats:</h3>
        Health:
        {' '}
        {you.currentHealth.toFormattedNumber()}
        <h3>MSG</h3>
      </>
    );
  }
  else if(fight.state === FIGHT_WON || fight.state === FIGHT_LOST) {
    content = (
      <Button onClick={() => createFightCmd()}>
        Again?
      </Button>
    );
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
