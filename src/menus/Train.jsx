import React from 'react';
import {observer} from 'mobx-react';

import Fighter from '../Fighter.js';

function Train() {
  const fighter = React.useContext(Fighter);

  return (<>
    <h1>Training</h1>
    <h3>Stats:</h3>
    Speed: {fighter.speed}
    <button onClick={() => fighter.train('speed')}>Train</button><br/>
    Strength: {fighter.strength}
    <button onClick={() => fighter.train('strength')}>Train</button><br/>
    Constitution: {fighter.constitution}
    <button onClick={() => fighter.train('constitution')}>Train</button><br/>
    Skill: {fighter.skill}
    <button onClick={() => fighter.train('skill')}>Train</button><br/>
    Stanima: {fighter.stamina}
    <button onClick={() => fighter.train('stamina')}>Train</button><br/>
  </>);
}

export default observer(Train);
