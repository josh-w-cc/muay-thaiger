import React from 'react';
import {observer} from 'mobx-react';

import Button from '../../components/Button';
import Fighter from '../../Fighter.js';
import Skills from './Skills.jsx';
import TrainStat from './TrainStat.jsx';

import css from './Train.module.css';


function Train() {
  const fighter = React.useContext(Fighter);

  return (<>
    <h1>Training</h1>
    <h3>Stats:</h3>
    <TrainStat name="Agility" stat="agility"/>
    <TrainStat name="Strength" stat="strength"/>
    <TrainStat name="Constitution" stat="constitution"/>
    <TrainStat name="Skill" stat="skill"/>
    <TrainStat name="Stanima" stat="stamina"/>
    <h3>Skills:</h3>
    {Object.keys(Skills).filter(s => Skills[s].requires(fighter)).map(s => <div key={s}>{Skills[s].name}
      <Button onClick={() => Skills[s].action(fighter)}>Once</Button>
      <Button
        className={fighter.idling?.key === `train-${s}` ? css.idleActive : ''}
        onClick={() => fighter.idle(`train-${s}`, () => Skills[s].action(fighter))}
      >
        Idle
      </Button>
    </div>)}
  </>);
}

export default observer(Train);
