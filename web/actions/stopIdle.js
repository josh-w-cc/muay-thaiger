import {SKILL_IDS} from 'shared/skills.js';

import {removeFighterActionCmd} from '@/actions/websockets/clientCommands.js';
import useFighterActionsStore from '@/data/fighterActions.js';


export default function stopIdle({skillKey}) {
  const actionID = SKILL_IDS[skillKey];
  if(!Number.isInteger(actionID)) {
    return;
  }
  useFighterActionsStore.getState().removeAction(actionID);
  removeFighterActionCmd(actionID);
}
