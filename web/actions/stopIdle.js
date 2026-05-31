import {getSkillActionID} from 'shared/skills.js';

import {removeFighterActionCmd} from '@/actions/websockets/clientCommands.js';
import useFighterActionsStore from '@/data/fighterActions.js';


export default function stopIdle({skillKey}) {
  const actionID = getSkillActionID(skillKey);
  if(actionID === null) {
    return;
  }
  useFighterActionsStore.getState().removeAction(actionID);
  removeFighterActionCmd(actionID);
}
