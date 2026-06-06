import {createFighterActionCmd} from '@/actions/websockets/clientCommands.js';
import useFighterActionsStore from '@/data/fighterActions.js';
import getActionIDBySkillKey from './getActionIDBySkillKey.js';


export default function startIdle({skillKey}) {
  const actionID = getActionIDBySkillKey(skillKey);
  if(actionID === null) {
    return;
  }
  useFighterActionsStore.getState().addAction({action: actionID});
  createFighterActionCmd(actionID);
}
