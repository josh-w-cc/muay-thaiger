import {SKILL_IDS} from 'shared/skills/ids.js';

import startIdle from '@/actions/idle/start.js';
import stopIdle from '@/actions/idle/stop.js';


export function isActionEnabled(actions, skillKey) {
  const actionID = SKILL_IDS[skillKey];
  return actions.some((action) => action.action === actionID);
}

export function onActionButtonClick({actionEnabled, skillKey}) {
  if(actionEnabled) {
    stopIdle({skillKey});
    return;
  }
  startIdle({skillKey});
}
