import {applyTrainingActions, createTrainingTimeline, getActionWithMaxTouchedAt, getMaxTouchedAtMs} from 'shared/training.js';

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

function trainFighter(actions) {
  if(!actions.length) {
    return;
  }
  applyTrainingActions(actions, useFighterStore.getState());
}
