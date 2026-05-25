import BaseStats, {RACES} from './baseStats.js';


const initialRace = `${RACES[0].id}`;

export function getInitialState() {
  return {
    createdAt: null,
    displayName: '',
    gold: 0,
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
  };
}

function getCombatState({agility, constitution, durability, reach, skill, stamina, strength}) {
  return {
    apm: Math.max(0, Math.log(agility)) + Math.sqrt(skill),
    attack: Math.max(0, Math.log(stamina)) + Math.sqrt(agility) + skill + reach,
    defense: Math.max(0, Math.log(agility)) + Math.sqrt(stamina) + skill,
    health: stamina + constitution * constitution + durability * durability,
    power: (strength + agility) * Math.sqrt(stamina) + skill,
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
