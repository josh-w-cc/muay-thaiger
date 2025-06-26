import React from 'react';
import {observer} from 'mobx-react';

import Button from '../../components/Button';
import Fighter from '../../Fighter.js';
import Idle from '../../Idle.js';


function TrainStat({name, stat}) {
  const fighter = React.useContext(Fighter);
  const idle = React.useContext(Idle);

  const style = {};
  if(idle.key === `train-${stat}`) {
    style.color = 'orange';
  }

  return (<>
    {name}: {fighter[stat]}
    <Button onClick={() => fighter.train(stat)}>Train</Button>
    <Button onClick={() => idle.start(`train-${stat}`, () => fighter.train(stat))} style={style}>Idle</Button>
    <br/>
  </>);
}
export default observer(TrainStat);
