import React from 'react';

import useFighterStore from '@/data/fighter.js';
import useFightStore, {FIGHT_IN_PROGRESS, FIGHT_NOT_STARTED, FIGHT_LOST, FIGHT_WON} from '../../Fight.js';
import formatHugeNumber from "@/utils/formatHugeNumber.js";

import Button from '../../components/Button.jsx';

import ZerothFight, {needsZerothFight} from './ZerothFight.jsx';


function FightMenu() {
  const fight = useFightStore();
  const fighter = useFighterStore();
  const [announcer, setAnnouncer] = React.useState('');
  const [risk, setRisk] = React.useState(1);

  if(needsZerothFight(fighter)) {
    return (<ZerothFight />);
  }

  let content;
  if(fight.state === FIGHT_NOT_STARTED) {
    content = (<>
      Risk: <select onChange={e => setRisk(e.target.options[e.target.selectedIndex].value)}>
        <option value={0}>Minimal</option>
        <option value={1}>Low</option>
        <option value={2}>Moderate</option>
        <option value={3}>High</option>
        <option value={4}>ALL!</option>
      </select>
      <Button onClick={() => fight.forGold(fighter, risk)}>Fight!</Button>
    </>);
  }
  else if(fight.state === FIGHT_IN_PROGRESS) {
    const [you, them] = fight.fighters;
    content = (<>
      <h3>Enemy Stats:</h3>
      APM: {formatHugeNumber(them.stats.apm)}<br/>
      Attack: {formatHugeNumber(them.stats.attack)}<br/>
      Defense: {formatHugeNumber(them.stats.defense)}<br/>
      Health: {formatHugeNumber(them.stats.health)}<br/>
      Power: {formatHugeNumber(them.stats.power)}<br/>
      Stamina: {formatHugeNumber(them.stats.stamina)}<br/>
      Health: {formatHugeNumber(them.currentHealth)}<br/>
      <Button onClick={() => setAnnouncer(fight.attack(0))}>Attack!</Button>
      <h3>Stats:</h3>
      Health: {formatHugeNumber(you.currentHealth)}
      <h3>MSG</h3>
    </>);
  }
  else if(fight.state === FIGHT_WON || fight.state === FIGHT_LOST) {
    content = (<Button onClick={() => {
      fight.finish();
      setAnnouncer('');
    }}>Again?</Button>);
  }
  return (<>
    <h1>Fight for ฿</h1>
    <h2>{announcer}</h2>
    {content}
    {fight.messages.slice().reverse()}
  </>);
}

export default FightMenu;
