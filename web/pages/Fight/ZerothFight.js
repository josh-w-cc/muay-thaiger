import React from 'react';

import useFighterStore from '@/data/fighter.js';
import {parseWholeBigInt} from 'shared/fighter-stats.js';


import css from './ZerothFight.module.css';


// eslint-disable-next-line max-lines-per-function
function ZerothFight() {
  const fighter = useFighterStore();
  const [event, setEvent] = React.useState('');

  if(event) {
    return event;
  }
  if((parseWholeBigInt(fighter.gold) ?? 0n) < 100n) {
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
      {fighter.stamina
        ? (
            <span>
              You catch him, but you lack the
              <strong>strength</strong>
              {' '}
              to get your ฿ back.
            </span>
          )
        : (
            <span>
              You need more
              <strong>stanima</strong>
              {' '}
              to catch him.
            </span>
          )}
    </div>,
  );
}

export default ZerothFight;


export function needsZerothFight(fighter) {
  return ((parseWholeBigInt(fighter.gold) ?? 0n) < 100n || !fighter.strength || !fighter.stamina);
}
