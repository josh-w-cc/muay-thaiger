import {createTrainingTimeline as createSharedTrainingTimeline} from 'shared/trainingTimeline.js';

export function createTrainingTimeline(actions, skillsByActionID, now) {
  const actionsWithSkills = actions.map((action) => ({...action, skill: skillsByActionID[action.action_id]}));
  const {appliedActions, touchedAtByActionKey} = createSharedTrainingTimeline(actionsWithSkills, {
    getDurationMs: (action) => (action.skill?.duration || 0) * 1000,
    getTouchedAtKey: (action) => action.id,
    now,
  });
  return {appliedActions, touchedAtByActionID: touchedAtByActionKey};
}
