import {applyTrainingAction, getTrainingDurationMs} from 'shared/training.js';
import {createTrainingTimeline} from 'shared/trainingTimeline.js';
export {findLatestAction, getActionTime} from 'shared/trainingTimeline.js';

import useFighterStore from '@/data/fighter.js';


export function runFighterActionTick(actions) {
  const nowMs = Date.now();
  const {appliedActions, touchedAtByActionKey} = createTrainingTimeline(actions, {
    getDurationMs: getTrainingDurationMs,
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
  return actions
    .map((action, index) => ({action, durationMs: getTrainingDurationMs(action), index}))
    .filter((action) => action.durationMs > 0);
}

function trainFighter(actions) {
  if(!actions.length) {
    return;
  }
  const fighter = useFighterStore.getState();
  for(const action of actions) {
    applyTrainingAction(action, fighter);
  }
}
