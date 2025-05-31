import React from 'react';
import {observer} from 'mobx-react';

import Fighter from '../Fighter.js';

function Train() {
  const fighter = React.useContext(Fighter);

  return (<>
    <h1>Training</h1>
    <h3>Stats:</h3>
    Speed: {fighter.speed}
    Strength: {fighter.strength}
    Vitality: {fighter.vitality}
    <button onClick={() => fighter.train('speed')}>Train</button>
  </>);
}

export default observer(Train);
