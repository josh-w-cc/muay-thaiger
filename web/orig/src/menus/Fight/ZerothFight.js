import React from 'react';

import useFighterStore from '@/data/fighter.js';


import css from './ZerothFight.module.css';


function ZerothFight() {
  const fighter = useFighterStore();
  const [event, setEvent] = React.useState('');

  if(event) {
    return event;
  }
  if(fighter.gold < 100) {
    setEvent(<div className={css.message}>Come back when you have the <strong>฿</strong>, kid.</div>);
    return;
  }
  fighter.spend(fighter.gold);
  setEvent(<div className={css.message}>He takes your ฿ and pushes you down.  He runs off.  {fighter.stamina ?
    <span>You catch him, but you lack the <strong>strength</strong> to get your ฿ back.</span> :
    <span>You need more <strong>stamina</strong> to catch him.</span>}
  </div>);
}

export default ZerothFight;


export function needsZerothFight(fighter) {
  return (fighter.gold < 100 || !fighter.strength || !fighter.stamina);
}
