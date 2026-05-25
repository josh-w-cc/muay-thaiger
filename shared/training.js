import {SKILLS_BY_ACTION_ID} from './skills.js';

export function applyTrainingAction(action, fighter) {
  const skill = getTrainingSkill(action);
  skill?.action(fighter);
}

export function applyTrainingActions(actions, fighter) {
  for(const action of actions) {
    applyTrainingAction(action, fighter);
  }
}

export function getTrainingDurationMs(action) {
  return (getTrainingSkill(action)?.duration || 0) * 1000;
}

export function getTrainingEffect({anima, speed, vigor, vitality}) {
  return {
    agility: toBigInt(speed),
    constitution: toBigInt(vitality),
    skill: toBigInt(anima),
    stamina: toBigInt(vitality),
    strength: toBigInt(vigor),
  };
}

export function getTrainedStatValue(stats, stat, multiplier = 1) {
  const trainingEffect = getTrainingEffect(stats);
  if(!Object.hasOwn(trainingEffect, stat)) {
    return null;
  }

  return getStatValue(stats, stat) + trainingEffect[stat] * toBigInt(multiplier);
}

function getTrainingSkill(action) {
  return SKILLS_BY_ACTION_ID[action?.action_id];
}

function getStatValue(stats, stat) {
  if(stats?.[stat] === undefined || stats?.[stat] === null) {
    return 0n;
  }
  return toBigInt(stats[stat]);
}

function toBigInt(value) {
  if(typeof value === 'bigint') {
    return value;
  }
  if(typeof value === 'number' && Number.isInteger(value)) {
    return BigInt(value);
  }
  if(typeof value === 'string' && /^-?\d+$/.test(value)) {
    return BigInt(value);
  }
  return 0n;
}
