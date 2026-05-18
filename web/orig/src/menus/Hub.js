import React from 'react';

import formatHugeNumber from '../formatHugeNumber.js';
import useFighterStore from '../Fighter.js';

function Hub() {
  const fighter = useFighterStore();

  return (<>
    <h1>HUB</h1>
    <h3>Stats:</h3>
    Agility: {formatHugeNumber(fighter.agility)}<br/>
    Speeed: {formatHugeNumber(fighter.speed)}<br/>
    Strength: {formatHugeNumber(fighter.strength)}<br/>
    Innate Strength: {formatHugeNumber(fighter.innateStrength)}<br/>
    Vitality: {formatHugeNumber(fighter.vitality)}<br/>
    Anima: {formatHugeNumber(fighter.anima)}<br/>
    Durability: {formatHugeNumber(fighter.durability)}<br/>
    Reach: {formatHugeNumber(fighter.reach)}<br/>
    Constitution: {formatHugeNumber(fighter.constitution)}<br/>
    Skill: {formatHugeNumber(fighter.skill)}<br/>
    Stanima: {formatHugeNumber(fighter.stamina)}<br/>
    ฿: {formatHugeNumber(fighter.gold / 100)}<br/>
    APM: {formatHugeNumber(fighter.apm)}<br/>
    Attack: {formatHugeNumber(fighter.attack)}<br/>
    Defense: {formatHugeNumber(fighter.defense)}<br/>
    Health: {formatHugeNumber(fighter.health)}<br/>
    Power: {formatHugeNumber(fighter.power)}<br/>
  </>);
}

export default Hub;
