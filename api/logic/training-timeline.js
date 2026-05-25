import {getTrainingDurationMs} from 'shared/training.js';
import {createTrainingTimeline as createSharedTrainingTimeline} from 'shared/trainingTimeline.js';

export function createTrainingTimeline(actions, now) {
  const {appliedActions, touchedAtByActionKey} = createSharedTrainingTimeline(actions, {
    getDurationMs: getTrainingDurationMs,
    getTouchedAtKey: (action) => action.id,
    now,
  });
  return {appliedActions, touchedAtByActionID: touchedAtByActionKey};
}
