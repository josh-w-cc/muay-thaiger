import {SKILLS_BY_ACTION_ID} from './skills.js';

export function applyTrainingAction(action, fighter) {
  const skill = getTrainingSkill(action);
  skill?.action(fighter);
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

  return (stats[stat] || 0) + trainingEffect[stat] * multiplier;
}

function getTrainingSkill(action) {
  return SKILLS_BY_ACTION_ID[action?.action_id];
}
