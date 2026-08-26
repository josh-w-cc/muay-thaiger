import {removeFighterActionCmd} from '@/actions/websockets/clientCommands.js';
import useFighterActionsStore from '@/data/fighter/fighterActions.js';
import getActionIDBySkillKey from './getActionIDBySkillKey.js';


export default function stopIdle({skillKey}) {
  const actionID = getActionIDBySkillKey(skillKey);
  if(!actionID) {
    throw new Error('Unknown skill!?');
  }
  useFighterActionsStore.getState().removeAction(actionID);
  removeFighterActionCmd(actionID);
}
