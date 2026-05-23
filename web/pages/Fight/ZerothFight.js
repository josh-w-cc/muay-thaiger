import React from 'react';

import useFighterStore from '@/data/fighter.js';


import css from './ZerothFight.module.css';


const MESSAGE_MISSING_STAMINA = (
  <span>
    You need more
    <strong>stanima</strong>
    {' '}
    to catch him.
  </span>
);
const MESSAGE_MISSING_STRENGTH = (
  <span>
    You catch him, but you lack the
    <strong>strength</strong>
    {' '}
    to get your ฿ back.
  </span>
);


// eslint-disable-next-line max-lines-per-function
function ZerothFight() {
  const fighter = useFighterStore();
  const [event, setEvent] = React.useState('');

  if(event) {
    return event;
  }
  if(fighter.gold < 100) {
    setEvent(
      <div className={css.message}>
        Come back when you have the
        <strong>฿</strong>
        , kid.
      </div>,
    );
    return;
  }
  fighter.spend(fighter.gold);
  setEvent(
    <div className={css.message}>
      He takes your ฿ and pushes you down.  He runs off.
      {getEscapeMessage(fighter)}
    </div>,
  );
}

export default ZerothFight;

function getEscapeMessage({stamina, strength}) {
  if(!stamina) {
    return MESSAGE_MISSING_STAMINA;
  }
  if(!strength) {
    return MESSAGE_MISSING_STRENGTH;
  }
  return null;
}


export function needsZerothFight(fighter) {
  return (fighter.gold < 100 || !fighter.strength || !fighter.stamina);
}
