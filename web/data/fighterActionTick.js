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

function trainFighter(actions) {
  if(!actions.length) {
    return;
  }
  applyTrainingActions(actions, useFighterStore.getState());
}
