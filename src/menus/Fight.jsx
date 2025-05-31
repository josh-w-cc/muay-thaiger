import React from 'react';
import {observer} from 'mobx-react';

import Fighter from '../Fighter.js';

function Train() {
  const fighter = React.useContext(Fighter);
  const [announcer, setAnnouncer] = React.useState('')

  return (<>
    <h1>Fight</h1>
    <h2>{announcer}</h2>
    <h3>Enemy Stats:</h3>
    Speed: {fighter.speed}
    Strength: {fighter.strength}
    Vitality: {fighter.vitality}
    <button onClick={() => setAnnouncer(Math.random() > 0.5 ? 'You a Winner, hahaha!' : 'Loo-hoo-seh-her')}>Fight!</button>
    <h3>Stats:</h3>
    Speed: {fighter.speed}
    Strength: {fighter.strength}
    Vitality: {fighter.vitality}
  </>);
}

export default observer(Train);
