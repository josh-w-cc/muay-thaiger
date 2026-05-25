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
  const [a, co, du, re, sk, st, str] = [agility, constitution, durability, reach, skill, stamina, strength].map(Number);
  return {
    apm: Math.max(0, Math.log(a)) + Math.sqrt(sk),
    attack: Math.max(0, Math.log(st)) + Math.sqrt(a) + sk + re,
    defense: Math.max(0, Math.log(a)) + Math.sqrt(st) + sk,
    health: st + co * co + du * du,
    power: (str + a) * Math.sqrt(st) + sk,
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
