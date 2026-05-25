import {SKILL_IDS} from 'shared/skills.js';

import startIdle from '@/actions/startIdle.js';
import stopIdle from '@/actions/stopIdle.js';


export function isActionEnabled(actions, skillKey) {
  const actionID = SKILL_IDS[skillKey];
  return actions.some((action) => action.action_id === actionID);
}

export function onActionButtonClick({actionEnabled, skillKey}) {
  if(actionEnabled) {
    stopIdle({skillKey});
    return;
  }
  startIdle({skillKey});
}
