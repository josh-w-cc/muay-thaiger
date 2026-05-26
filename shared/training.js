import {SKILLS_BY_ACTION_ID} from './skills.js';
import {createTrainingTimeline as createSharedTrainingTimeline, getScheduledActions} from './trainingTimeline.js';

export function applyTrainingAction(action, fighter) {
  const skill = getTrainingSkill(action);
  skill?.action(fighter);
}

export function applyTrainingActions(actions, fighter) {
  for(const action of actions) {
    applyTrainingAction(action, fighter);
  }
}

export function createTrainingTimeline(actions, options = {}) {
  return createSharedTrainingTimeline(actions, {
    ...options,
    getDurationMs: getTrainingDurationMs,
  });
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

export function getMaxTouchedAtMs(actions) {
  const values = actions.map(getTouchedAtMs).filter((ms) => ms !== null);
  return values.length ? Math.max(...values) : null;
}

export function getScheduledTrainingActions(actions) {
  return getScheduledActions(actions, getTrainingDurationMs);
}

export function getTrainingDurationMs(action) {
  return (getTrainingSkill(action)?.duration || 0) * 1000;
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
  return SKILLS_BY_ACTION_ID[action?.action_id];
}

function getTouchedAtMs(action) {
  const ms = Date.parse(action.touched_at);
  return Number.isNaN(ms) ? null : ms;
}
