import {SKILLS_BY_ACTION_ID} from './skills.js';
import {createTrainingTimeline as createSharedTrainingTimeline, getScheduledActions} from './trainingTimeline.js';

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

  return BigInt(stats[stat] ?? 0) + trainingMultiplier * BigInt(amount);
}

export function getMaxTouchedAtMs(actions) {
  const values = actions.map(getTouchedAtMs).filter((ms) => ms !== null);
  return values.length ? Math.max(...values) : null;
}

export function findTouchedAtTransfer(removedActions, remainingActions) {
  if(!remainingActions.length) {
    return null;
  }
  const maxRemovedMs = getMaxTouchedAtMs(removedActions);
  if(maxRemovedMs === null) {
    return null;
  }
  const maxRemainingMs = getMaxTouchedAtMs(remainingActions);
  if(maxRemainingMs !== null && maxRemovedMs <= maxRemainingMs) {
    return null;
  }
  return {targetAction: getActionWithMaxTouchedAt(remainingActions), touchedAt: new Date(maxRemovedMs)};
}

function getActionWithMaxTouchedAt(actions) {
  return actions.reduce((best, action) => {
    const bestMs = getTouchedAtMs(best);
    const actionMs = getTouchedAtMs(action);
    if(bestMs === null) {
      return action;
    }
    if(actionMs === null) {
      return best;
    }
    return actionMs >= bestMs ? action : best;
  });
}

function getTrainingSkill(action) {
  return SKILLS_BY_ACTION_ID[action?.action];
}

function getTrainingMultiplier(stats, stat) {
  const multiplierStat = TRAINING_MULTIPLIER_BY_STAT[stat];
  if(!multiplierStat) {
    return null;
  }
  return BigInt(stats[multiplierStat] ?? 0);
}

function getTouchedAtMs(action) {
  const ms = Date.parse(action.touched_at);
  return Number.isNaN(ms) ? null : ms;
}
