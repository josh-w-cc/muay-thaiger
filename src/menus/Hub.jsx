import React from 'react';
import {observer} from 'mobx-react';

import Fighter from '../Fighter.js';

function Hub() {
  const fighter = React.useContext(Fighter);

  return (<>
    <h1>HUB</h1>
    <h3>Stats:</h3>
    Speeed: {fighter.speed}<br/>
    Innate Speeed: {fighter.innateSpeed}<br/>
    Strength: {fighter.strength}<br/>
    Innate Strength: {fighter.innateStrength}<br/>
    Vitality: {fighter.vitality}<br/>
    Anima: {fighter.anima}<br/>
    Durability: {fighter.durability}<br/>
    Reach: {fighter.reach}<br/>
    Constitution: {fighter.constitution}<br/>
    Skill: {fighter.skill}<br/>
    Stanima: {fighter.stamina}<br/>
    ฿: {fighter.gold / 100}<br/>
  </>);
}

export default observer(Hub);
