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
    agility: speed,
    constitution: vitality,
    skill: anima,
    stamina: vitality,
    strength: vigor,
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
