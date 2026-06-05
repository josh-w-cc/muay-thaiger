import {SKILL_IDS} from 'shared/skills/index.js';

import startIdle from '@/actions/idle/startIdle.js';
import stopIdle from '@/actions/idle/stopIdle.js';


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
