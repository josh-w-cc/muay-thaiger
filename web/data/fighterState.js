import {RACES} from 'shared/races.js';
import {normalizeFighterStats, toSafeNumber} from 'shared/fighter-stats.js';

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
  return normalizeFighterStats({
    agility: 0,
    anima,
    constitution: 0,
    durability,
    vigor,
    reach,
    skill: 0,
    speed,
    stamina: 0,
    strength: 0,
    vitality,
  });
}

function getCombatState({agility, constitution, durability, reach, skill, stamina, strength}) {
  const agilityValue = toSafeNumber(agility);
  const constitutionValue = toSafeNumber(constitution);
  const durabilityValue = toSafeNumber(durability);
  const reachValue = toSafeNumber(reach);
  const skillValue = toSafeNumber(skill);
  const staminaValue = toSafeNumber(stamina);
  const strengthValue = toSafeNumber(strength);

  return {
    apm: Math.max(0, Math.log(agilityValue)) + Math.sqrt(skillValue),
    attack: Math.max(0, Math.log(staminaValue)) + Math.sqrt(agilityValue) + skillValue + reachValue,
    defense: Math.max(0, Math.log(agilityValue)) + Math.sqrt(staminaValue) + skillValue,
    health: staminaValue + constitutionValue * constitutionValue + durabilityValue * durabilityValue,
    power: (strengthValue + agilityValue) * Math.sqrt(staminaValue) + skillValue,
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
