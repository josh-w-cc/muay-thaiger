import React from 'react';

import Button from '../../components/Button';
import useFighterStore from '../../Fighter.js';

import css from './Train.module.css';


function TrainStat({name, stat}) {
  const fighter = useFighterStore();

  const idleActive = fighter.idling?.key === `train-${stat}`;

  return (<>
    {name}: {fighter[stat]}
    <Button onClick={() => fighter.train(stat)}>Train</Button>
    <Button
      className={idleActive ? css.idleActive : ''}
      onClick={() => fighter.idle(`train-${stat}`, () => fighter.train(stat))}
    >Idle</Button>
    <br/>
  </>);
}
export default TrainStat;
