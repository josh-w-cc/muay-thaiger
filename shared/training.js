import {SKILLS_BY_ACTION_ID} from './skills.js';
import {createTrainingTimeline as createSharedTrainingTimeline, getScheduledActions} from './trainingTimeline.js';

export {findLatestAction, getActionTime} from './trainingTimeline.js';

const TRAINING_MULTIPLIER_BY_STAT = Object.freeze({
  agility: 'speed',
  constitution: 'vitality',
  skill: 'anima',
  stamina: 'vitality',
  strength: 'vigor',
});

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

export function createTrainingTimeline(actions, options = {}) {
  return createSharedTrainingTimeline(actions, {
    ...options,
    getDurationMs: getTrainingDurationMs,
  });
}

export function getScheduledTrainingActions(actions) {
  return getScheduledActions(actions, getTrainingDurationMs);
}

export function getTrainingEffect({anima = 0, speed = 0, vigor = 0, vitality = 0}) {
  return {
    agility: speed,
    constitution: vitality,
    skill: anima,
    stamina: vitality,
    strength: vigor,
  };
}

export function getTrainedStatValue(stats, stat, amount = 1) {
  const trainingMultiplier = getTrainingMultiplier(stats, stat);
  if(trainingMultiplier === null) {
    return null;
  }

  return (stats[stat] || 0) + trainingMultiplier * amount;
}

function getTrainingSkill(action) {
  return SKILLS_BY_ACTION_ID[action?.action_id];
}

function getTrainingMultiplier(stats, stat) {
  const multiplierStat = TRAINING_MULTIPLIER_BY_STAT[stat];
  if(!multiplierStat) {
    return null;
  }
  return stats[multiplierStat] || 0;
}
