import React from 'react';

import Button from '../../components/Button';
import useFighterStore from '../../Fighter.js';


function TrainStat({name, stat}) {
  const fighter = useFighterStore();

  const style = {};
  if(fighter.idling?.key === `train-${stat}`) {
    style.color = 'orange';
  }

  return (<>
    {name}: {fighter[stat]}
    <Button onClick={() => fighter.train(stat)}>Train</Button>
    <Button onClick={() => fighter.idle(`train-${stat}`, () => fighter.train(stat))} style={style}>Idle</Button>
    <br/>
  </>);
}
export default TrainStat;
