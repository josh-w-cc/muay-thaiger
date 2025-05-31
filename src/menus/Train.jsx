import React from 'react';
import {observer} from 'mobx-react';

import Button from '../components/Button'
import Fighter from '../Fighter.js';

function Train() {
  const fighter = React.useContext(Fighter);

  return (<>
    <h1>Training</h1>
    <h3>Stats:</h3>
    Speed: {fighter.speed}
    <Button onClick={() => fighter.train('speed')}>Train</Button><br/>
    Strength: {fighter.strength}
    <Button onClick={() => fighter.train('strength')}>Train</Button><br/>
    Constitution: {fighter.constitution}
    <Button onClick={() => fighter.train('constitution')}>Train</Button><br/>
    Skill: {fighter.skill}
    <Button onClick={() => fighter.train('skill')}>Train</Button><br/>
    Stanima: {fighter.stamina}
    <Button onClick={() => fighter.train('stamina')}>Train</Button><br/>
  </>);
}

export default observer(Train);
