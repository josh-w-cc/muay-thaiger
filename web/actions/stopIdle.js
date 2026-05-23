import {SKILL_IDS} from 'shared/skills.js';

import {removeFighterActionCmd} from '@/actions/websockets/index.js';
import useFighterActionsStore from '@/data/fighterActions.js';
import useFighterStore from '@/data/fighter.js';


export default function stopIdle({skillKey}) {
  const actionID = SKILL_IDS[skillKey];
  if(!Number.isInteger(actionID)) {
    return;
  }
  useFighterActionsStore.getState().removeAction(actionID);
  if(useFighterStore.getState().idling?.key === `train-${skillKey}`) {
    useFighterStore.setState({idling: false});
  }
  removeFighterActionCmd(actionID);
}
