import {getSkillActionID} from 'shared/skills.js';

import {createFighterActionCmd} from '@/actions/websockets/clientCommands.js';
import useFighterActionsStore from '@/data/fighterActions.js';


export default function startIdle({skillKey}) {
  const actionID = getSkillActionID(skillKey);
  if(actionID === null) {
    return;
  }
  useFighterActionsStore.getState().addAction({action: actionID});
  createFighterActionCmd(actionID);
}
