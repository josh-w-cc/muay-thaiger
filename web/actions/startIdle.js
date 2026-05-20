import {SKILL_IDS} from 'shared/skills.js';

import {createFighterActionCmd} from '@/data/websocket.js';


export default function startIdle({fighter, skill, skillKey}) {
  fighter.idle(`train-${skillKey}`, () => skill.action(fighter));
  createFighterActionCmd(SKILL_IDS[skillKey]);
}
