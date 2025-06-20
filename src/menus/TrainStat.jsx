import React from 'react';
import {observer} from 'mobx-react';

import Button from '../components/Button';
import Fighter from '../Fighter.js';


function TrainStat({name, stat}) {
  const fighter = React.useContext(Fighter);

  const style = {};
  if(fighter.idling?.key === `train-${stat}`) {
    style.color = 'orange';
  }

  return (<>
    {name}: {fighter[stat]}
    <Button onClick={() => fighter.train(stat)}>Train</Button>
    <Button onClick={() => fighter.train(stat, true)} style={style}>Idle</Button>
    <br/>
  </>);
}
export default observer(TrainStat);
