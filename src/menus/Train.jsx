import React from 'react';
import {observer} from 'mobx-react';

import TrainStat from './TrainStat.jsx';


function Train() {
  return (<>
    <h1>Training</h1>
    <h3>Stats:</h3>
    <TrainStat name="Speeed" stat="speed" />
    <TrainStat name="Strength" stat="strength" />
    <TrainStat name="Constitution" stat="constitution" />
    <TrainStat name="Skill" stat="skill" />
    <TrainStat name="Stanima" stat="stamina" />
  </>);
}

export default observer(Train);
