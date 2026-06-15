import {RACES} from 'shared/races.js';

import BaseStats from './baseStats.js';


const initialRace = `${RACES[0].id}`;

export function getInitialState() {
  return {
    createdAt: null,
    displayName: '',
    gold: 0n,
    id: null,
    idling: false,
    ...getSelectionState(initialRace),
  };
}

export function getSelectionState(id) {
  const baseSelectionState = getBaseSelectionState(BaseStats[id].stats);
  const nextState = {race: id, ...baseSelectionState};

  return {
    ...nextState,
    ...getCombatState(nextState),
  };
}

function getBaseSelectionState({anima, durability, vigor, reach, speed, vitality}) {
  return {
    agility: 0n,
    anima,
    constitution: 0n,
    durability,
    vigor,
    reach,
    skill: 0n,
    speed,
    stamina: 0n,
    strength: 0n,
    vitality,
  };
}

function getCombatState({agility, constitution, durability, reach, skill, stamina, strength}) {
  return {
    apm: agility.logApprox() + skill.logApprox(),
    attack: stamina.logApprox() + agility.logApprox() + skill + reach,
    defense: agility.logApprox() + stamina.logApprox() + skill,
    health: stamina + constitution * constitution + durability * durability,
    power: (strength + agility) * stamina.logApprox() + skill,
  };
}

export function isFightIdling(idling) {
  return idling?.key?.substring(0, 5).toUpperCase() === 'FIGHT';
}

export function mergeState(state, updates) {
  const nextState = {
    ...state,
    ...updates,
  };

  return {...nextState, ...getCombatState(nextState)};
}
