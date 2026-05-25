import {applyTrainingActions, createTrainingTimeline, getScheduledTrainingActions} from 'shared/training.js';
export {findLatestAction, getActionTime} from 'shared/trainingTimeline.js';

import useFighterStore from '@/data/fighter.js';


export function runFighterActionTick(actions) {
  const nowMs = Date.now();
  const {appliedActions, touchedAtByActionKey} = createTrainingTimeline(actions, {
    getTouchedAtValue: (touchedAt) => touchedAt.toISOString(),
    now: new Date(nowMs),
  });
  trainFighter(appliedActions);
  return actions.map((action, index) => (
    touchedAtByActionKey.has(index)
      ? {...action, touched_at: touchedAtByActionKey.get(index)}
      : action
  ));
}

export function getScheduledActions(actions) {
  return getScheduledTrainingActions(actions);
}

export function transferLatestTouchedAt(removedActions, remainingActions) {
  if(!remainingActions.length) {
    return remainingActions;
  }
  const maxRemovedMs = getMaxTouchedAtMs(removedActions);
  if(maxRemovedMs === null) {
    return remainingActions;
  }
  const maxRemainingMs = getMaxTouchedAtMs(remainingActions);
  if(maxRemainingMs !== null && maxRemovedMs <= maxRemainingMs) {
    return remainingActions;
  }
  const targetAction = getActionWithMaxTouchedAt(remainingActions);
  return remainingActions.map((action) => (
    action === targetAction
      ? {...action, touched_at: new Date(maxRemovedMs).toISOString()}
      : action
  ));
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

function getMaxTouchedAtMs(actions) {
  const values = actions.map(getTouchedAtMs).filter((ms) => ms !== null);
  return values.length ? Math.max(...values) : null;
}

function getTouchedAtMs(action) {
  const ms = Date.parse(action.touched_at);
  return Number.isNaN(ms) ? null : ms;
}

function trainFighter(actions) {
  if(!actions.length) {
    return;
  }
  applyTrainingActions(actions, useFighterStore.getState());
}
