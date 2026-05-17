import React from 'react';
import {observer} from 'mobx-react';

import Button from '../../components/Button';
import Fighter from '../../Fighter.js';

import css from './Train.module.css';


function TrainStat({name, stat}) {
  const fighter = React.useContext(Fighter);

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
export default observer(TrainStat);
