import React from 'react';
import {observer} from 'mobx-react';

import Fighter from '../Fighter.js';
import Fight, {FIGHT_NOT_STARTED, FIGHT_STARTED, FIGHT_WON} from '../Fight.js';
import Button from '../components/Button.jsx';

function FightMenu() {
  const fight = React.useContext(Fight);
  const fighter = React.useContext(Fighter);
  const [announcer, setAnnouncer] = React.useState('');

  if(fighter.gold < 100 || !fighter.strength || !fighter.stamina) {
    return (<ZerothFight />);
  }

  let content;
  if(fight.state === FIGHT_NOT_STARTED) {
    const enemy = {
      apm: fighter.apm * (0.5 + Math.random()),
      attack: fighter.attack * (0.5 + Math.random()),
      defense: fighter.defense * (0.5 + Math.random()),
      health: fighter.health * (0.5 + Math.random()),
      power: fighter.power * (0.5 + Math.random()),
      stamina: fighter.stamina * (0.5 + Math.random()),
    };
    content = (<>
      <h3>Enemy Stats:</h3>
      APM: {enemy.apm}
      Attack: {enemy.attack}
      Defense: {enemy.defense}
      Health: {enemy.health}
      Power: {enemy.power}
      Stamina: {enemy.stamina}
      <Button onClick={() => fight.start(fighter, enemy)}>Fight!</Button>
      <h3>Stats:</h3>
      APM: {fighter.apm}
      Attack: {fighter.attack}
      Defense: {fighter.defense}
      Health: {fighter.health}
      Power: {fighter.power}
      Stamina: {fighter.stamina}
    </>);
  }
  else if(fight.state === FIGHT_STARTED) {
    const [you, them] = fight.fighters;
    content = (<>
      <h3>Enemy Stats:</h3>
      Health: {them.currentHealth}
      <Button onClick={() => setAnnouncer(fight.attack(0))}>Attack!</Button>
      <h3>Stats:</h3>
      Health: {you.currentHealth}
    </>);
  }
  else if(fight.state === FIGHT_WON) {
    content = (<Button onClick={fight.finish}>Again?</Button>);
  }
  return (<>
    <h1>Fight</h1>
    <h2>{announcer}</h2>
    {content}
  </>);
}

export default observer(FightMenu);


function ZerothFight() {
  const fighter = React.useContext(Fighter);
  const [event, setEvent] = React.useState('');

  if(event) {
    return event;
  }
  if(fighter.gold < 100) {
    setEvent(<span>Come back when you've got some <strong style={{color: 'orange'}}>฿</strong>, kid.</span>);
  }
  else if(!fighter.strength || !fighter.stamina) {
    fighter.gold = 0;
    setEvent(<span>He takes your ฿ and pushes you down.  He runs off.  {fighter.stamina ?
      <span>You catch him, but you don't have the <strong>strength</strong> to get your ฿ back.</span> :
      <span>You don't have the <strong>stanima</strong> to catch him.</span>}
    </span>);
  }
}