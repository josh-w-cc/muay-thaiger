import React from 'react';

import Fighter from '../../Fighter.js';
import Fight, {FIGHT_IN_PROGRESS, FIGHT_NOT_STARTED, FIGHT_LOST, FIGHT_WON} from '../../Fight.js';

import Button from '../../components/Button.jsx';

import ZerothFight, {needsZerothFight} from './ZerothFight.jsx';


function FightMenu() {
  const fight = React.useContext(Fight);
  const fighter = React.useContext(Fighter);
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
      APM: {them.stats.apm}<br/>
      Attack: {them.stats.attack}<br/>
      Defense: {them.stats.defense}<br/>
      Health: {them.stats.health}<br/>
      Power: {them.stats.power}<br/>
      Stamina: {them.stats.stamina}<br/>
      Health: {them.currentHealth}<br/>
      <Button onClick={() => setAnnouncer(fight.attack(0))}>Attack!</Button>
      <h3>Stats:</h3>
      Health: {you.currentHealth}
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
