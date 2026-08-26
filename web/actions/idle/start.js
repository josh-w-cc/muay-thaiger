import {createFighterActionCmd} from '@/actions/websockets/clientCommands.js';
import useFighterActionsStore from '@/data/fighter/fighterActions.js';
import getActionIDBySkillKey from './getActionIDBySkillKey.js';


export default function startIdle({skillKey}) {
  const actionID = getActionIDBySkillKey(skillKey);
  if(!actionID) {
    throw new Error('Unknown skill!?');
  }
  useFighterActionsStore.getState().addAction({action: actionID});
  createFighterActionCmd(actionID);
}
