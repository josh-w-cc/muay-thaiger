import {parseWholeBigInt} from './fighter-stats.js';
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
    agility: getBigIntStat(speed),
    constitution: getBigIntStat(vitality),
    skill: getBigIntStat(anima),
    stamina: getBigIntStat(vitality),
    strength: getBigIntStat(vigor),
  };
}

export function getTrainedStatValue(stats, stat, multiplier = 1) {
  const trainingEffect = getTrainingEffect(stats);
  if(!Object.hasOwn(trainingEffect, stat)) {
    return null;
  }

  return (parseWholeBigInt(stats[stat]) ?? 0n) + trainingEffect[stat] * (parseWholeBigInt(multiplier) ?? 0n);
}

function getTrainingSkill(action) {
  return SKILLS_BY_ACTION_ID[action?.action_id];
}

function getBigIntStat(value) {
  return parseWholeBigInt(value) ?? 0n;
}
