import {SKILL_IDS} from 'shared/skills.js';

import {createFighterActionCmd} from '@/actions/websockets/index.js';
import useFighterActionsStore from '@/data/fighterActions.js';


export default function startIdle({skillKey}) {
  const actionID = SKILL_IDS[skillKey];
  if(!Number.isInteger(actionID)) {
    return;
  }
  useFighterActionsStore.getState().addAction({action_id: actionID});
  createFighterActionCmd(actionID);
}
