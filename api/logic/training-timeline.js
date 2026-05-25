import {createTrainingTimeline as createSharedTrainingTimeline} from 'shared/training.js';

export function createTrainingTimeline(actions, now) {
  const {appliedActions, touchedAtByActionKey} = createSharedTrainingTimeline(actions, {
    getTouchedAtKey: (action) => action.id,
    now,
  });
  return {appliedActions, touchedAtByActionID: touchedAtByActionKey};
}
