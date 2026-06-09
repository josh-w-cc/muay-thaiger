import {SKILL_IDS} from 'shared/skills/ids.js';


export default function getActionIDBySkillKey(skillKey) {
  const actionID = SKILL_IDS[skillKey];
  if(!Number.isInteger(actionID)) {
    return null;
  }
  return actionID;
}
