import React from 'react';

import Button from '../../components/Button';
import useFighterStore from '../../Fighter.js';
import Skills from './Skills.jsx';
import TrainStat from './TrainStat.jsx';


function Train() {
  const fighter = useFighterStore();

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
      <Button onClick={() =>
        fighter.idle(`train-${s}`, () => Skills[s].action(fighter))} style={{color: fighter.idling?.key === `train-${s}` ? 'orange' : 'blue'}}>
        Idle
      </Button>
    </div>)}
  </>);
}

export default Train;
