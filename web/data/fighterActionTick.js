import {applyTrainingActions, createTrainingTimeline, findTouchedAtTransfer} from 'shared/training.js';

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
  const transfer = findTouchedAtTransfer(removedActions, remainingActions);
  if(!transfer) {
    return remainingActions;
  }
  return remainingActions.map((action) => (
    action === transfer.targetAction
      ? {...action, touched_at: transfer.touchedAt.toISOString()}
      : action
  ));
}

function trainFighter(actions) {
  if(!actions.length) {
    return;
  }
  applyTrainingActions(actions, useFighterStore.getState());
}
