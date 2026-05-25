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
    anima: toBigInt(anima),
    constitution: 0n,
    durability: toBigInt(durability),
    vigor: toBigInt(vigor),
    reach: toBigInt(reach),
    skill: 0n,
    speed: toBigInt(speed),
    stamina: 0n,
    strength: 0n,
    vitality: toBigInt(vitality),
  };
}

function getCombatState({agility, constitution, durability, reach, skill, stamina, strength}) {
  const agilityNumber = toDouble(agility);
  const reachNumber = toDouble(reach);
  const skillNumber = toDouble(skill);
  const staminaNumber = toDouble(stamina);
  const strengthNumber = toDouble(strength);

  return {
    apm: Math.max(0, Math.log(agilityNumber)) + Math.sqrt(skillNumber),
    attack: Math.max(0, Math.log(staminaNumber)) + Math.sqrt(agilityNumber) + skillNumber + reachNumber,
    defense: Math.max(0, Math.log(agilityNumber)) + Math.sqrt(staminaNumber) + skillNumber,
    health: toBigInt(stamina) + toBigInt(constitution) * toBigInt(constitution) + toBigInt(durability) * toBigInt(durability),
    power: (strengthNumber + agilityNumber) * Math.sqrt(staminaNumber) + skillNumber,
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

function toBigInt(value) {
  if(value === null || value === undefined || value === '') {
    return 0n;
  }
  try {
    return BigInt(value);
  }
  catch {
    return 0n;
  }
}

function toDouble(value) {
  if(typeof value === 'number') {
    return value;
  }
  return Number(toBigInt(value));
}
