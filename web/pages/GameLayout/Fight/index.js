import useFighterStore from '@/data/fighter.js';
import useFightStore, {FIGHT_IN_PROGRESS, FIGHT_NOT_STARTED, FIGHT_LOST, FIGHT_WON} from '@/data/fight.js';
import {createFightCmd} from '@/actions/websockets/clientCommands.js';
import Button from '@/components/Button.js';
import Section from '@/components/primitive/Section.js';

import FightForGlory from './FightForGlory/index.js';
import ZerothFight, {needsZerothFight} from './ZerothFight.js';

const ENEMY_STAT_FIELDS = [
  ['APM', 'apm'],
  ['Attack', 'attack'],
  ['Defense', 'defense'],
  ['Health', 'health'],
  ['Power', 'power'],
  ['Stanima', 'stamina'],
];


export default function FightMenu() {
  const fight = useFightStore();
  const fighter = useFighterStore();

  if(needsZerothFight(fighter)) {
    return (<ZerothFight />);
  }

  return (
    <>
      <Section>
        <h1>Fight for ฿</h1>
        <FightContent fight={fight} />
      </Section>
      <FightForGlory />
    </>
  );
}

function FightContent({fight}) {
  if(fight.state === FIGHT_NOT_STARTED) {
    return (<Button onClick={() => createFightCmd('gold')}>Fight!</Button>);
  }
  if(fight.state === FIGHT_IN_PROGRESS) {
    return (<InProgressFight fight={fight} />);
  }
  if(fight.state === FIGHT_WON || fight.state === FIGHT_LOST) {
    return (<Button onClick={() => createFightCmd()}>Again?</Button>);
  }
  return null;
}

function FightStat({label, value}) {
  return (
    <>
      {label}
      {': '}
      {value.toFormattedNumber()}
      <br />
    </>
  );
}

function InProgressFight({fight}) {
  const [you, them] = fight.fighters;

  return (
    <>
      <h3>Enemy Stats:</h3>
      {ENEMY_STAT_FIELDS.map(([label, key]) => <FightStat key={key} label={label} value={them.stats[key]} />)}
      <FightStat label="Health" value={them.currentHealth} />
      <h3>Stats:</h3>
      <FightStat label="Health" value={you.currentHealth} />
      <h3>MSG</h3>
      {fight.messages.slice().reverse()}
    </>
  );
}
