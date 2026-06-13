import {SKILLS_BY_ACTION_ID} from './skills/index.js';
import {
  createTrainingTimeline as createSharedTrainingTimeline,
  findLatestAction,
  getOrderedActions,
  getScheduledActions,
} from './trainingTimeline.js';

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

export function findActiveTrainingAction(actions, options = {}) {
  let now = new Date();
  if(options.now) {
    now = options.now;
  }
  const nowMs = now.getTime();
  const scheduledActions = getScheduledTrainingActions(actions);
  if(scheduledActions.length === 0) {
    return null;
  }
  const orderedActions = getOrderedActions(scheduledActions, nowMs);
  const {latestActionTime} = findLatestAction(orderedActions, nowMs);
  const actionIndex = getActiveActionIndex(orderedActions, nowMs - latestActionTime);
  return orderedActions[actionIndex].action;
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

function getActiveActionIndex(orderedActions, remainingMs) {
  let actionIndex = 0;
  while(remainingMs > 0 && remainingMs >= orderedActions[actionIndex].durationMs) {
    remainingMs -= orderedActions[actionIndex].durationMs;
    actionIndex = (actionIndex + 1) % orderedActions.length;
  }
  return actionIndex;
}

function getTrainingSkill(action) {
  return SKILLS_BY_ACTION_ID[action?.action];
}

function getTouchedAtMs(action) {
  const ms = Date.parse(action.touched_at);
  return Number.isNaN(ms) ? null : ms;
}
