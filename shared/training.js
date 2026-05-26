import {SKILLS_BY_ACTION_ID} from './skills.js';
import {createTrainingTimeline as createSharedTrainingTimeline, findLatestAction, getActionTime, getScheduledActions} from './trainingTimeline.js';
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
export function getTrainingProgressByActionKey(actions, {getActionKey = (_, index) => index, now = new Date()} = {}) {
  const progressByActionKey = new Map(actions.map((action, index) => [getActionKey(action, index), 0]));
  const progress = getCurrentTrainingProgress(getScheduledTrainingActions(actions), now.getTime());
  if(progress === null) {
    return progressByActionKey;
  }
  progressByActionKey.set(getActionKey(progress.action.action, progress.action.index), progress.value);
  return progressByActionKey;
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
function getCurrentTrainingProgress(actions, nowMs) {
  const orderedActions = getOrderedTrainingActions(actions, nowMs);
  if(!orderedActions.length) {
    return null;
  }
  const {latestActionTime} = findLatestAction(orderedActions, nowMs);
  let remainingMs = nowMs - latestActionTime;
  if(remainingMs <= 0) {
    return null;
  }
  let actionIndex = 0;
  while(remainingMs >= orderedActions[actionIndex].durationMs) {
    remainingMs -= orderedActions[actionIndex].durationMs;
    actionIndex = (actionIndex + 1) % orderedActions.length;
  }
  return {action: orderedActions[actionIndex], value: Math.floor(remainingMs / orderedActions[actionIndex].durationMs * 100)};
}
function getOrderedTrainingActions(actions, nowMs) {
  return [...actions].sort((leftAction, rightAction) => {
    const leftTime = getActionTime(leftAction.action, nowMs);
    const rightTime = getActionTime(rightAction.action, nowMs);
    if(leftTime === rightTime) {
      return leftAction.index - rightAction.index;
    }
    return leftTime - rightTime;
  });
}
function getTrainingSkill(action) {
  return SKILLS_BY_ACTION_ID[action?.action];
}
function getTouchedAtMs(action) {
  const ms = Date.parse(action.touched_at);
  return Number.isNaN(ms) ? null : ms;
}
