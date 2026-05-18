import BaseStats, {RACE_STATICS} from './baseStats.js';


const initialRace = `${RACE_STATICS[0].id}`;

export function getInitialState() {
  return {
    gold: 0,
    idling: false,
    ...getSelectionState(initialRace),
  };
}

export function isFightIdling(idling) {
  return idling?.key?.substring(0, 5).toUpperCase() === 'FIGHT';
}

export function isTrainIdling(idling) {
  return idling?.key?.substring(0, 5).toLowerCase() === 'train';
}

export function mergeState(state, updates) {
  const nextState = {
    ...state,
    ...updates,
  };

  return {...nextState, ...getCombatState(nextState)};
}

export function tickTrain({delta, get, idling, set}) {
  set((state) => mergeState(state, {idling: {...idling, delta: idling.delta + delta}}));

  const {idling: nextIdling} = get();
  if(nextIdling.delta <= 1000) {
    return;
  }

  nextIdling.action();
  const {idling: updatedIdling} = get();
  if(updatedIdling) {
    set((state) => mergeState(state, {idling: {...updatedIdling, delta: updatedIdling.delta - 1000}}));
  }
}

export function getTrainingEffect({anima, innateStrength, speed, vitality}) {
  return {
    agility: speed,
    constitution: vitality,
    skill: anima,
    stamina: vitality,
    strength: innateStrength,
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

export function getSelectionState(id) {
  const baseSelectionState = getBaseSelectionState(BaseStats[id].stats);
  const nextState = {race: id, ...baseSelectionState};

  return {
    ...nextState,
    ...getCombatState(nextState),
  };
}

function getBaseSelectionState({anima, durability, reach, speed, strength: innateStrength, vitality}) {
  return {
    agility: 0,
    anima,
    constitution: 0,
    durability,
    innateStrength,
    reach,
    skill: 0,
    speed,
    stamina: 0,
    strength: 0,
    vitality,
  };
}
