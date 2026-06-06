import {removeFighterActionCmd} from '@/actions/websockets/clientCommands.js';
import useFighterActionsStore from '@/data/fighterActions.js';
import getActionIDBySkillKey from './getActionIDBySkillKey.js';


export default function stopIdle({skillKey}) {
  const actionID = getActionIDBySkillKey(skillKey);
  if(actionID === null) {
    return;
  }
  useFighterActionsStore.getState().removeAction(actionID);
  removeFighterActionCmd(actionID);
}
