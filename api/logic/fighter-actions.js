import {SKILL_DEFINITIONS, SKILL_IDS} from 'shared/skills.js';
import {createCommandError} from './command-errors.js';

const SKILLS_BY_ACTION_ID = Object.freeze(
  Object.fromEntries(
    Object.entries(SKILL_IDS).map(([skillKey, id]) => [id, SKILL_DEFINITIONS[skillKey]]),
  ),
);

export async function registerFighterAction({fighterActions, fighters}, message, playerID) {
  const normalizedMessage = normalizeMessage(message);
  if(!normalizedMessage) {
    throw createCommandError('invalid-idle-message');
  }
  const currentFighter = await fighters.findCurrentByPlayerID(playerID);
  if(!currentFighter || !isValidAction(currentFighter, normalizedMessage.action_id)) {
    throw createCommandError('invalid-idle-message');
  }
  return await fighterActions.create({
    action_id: normalizedMessage.action_id,
    fighter_id: currentFighter.id,
  });
}

function isValidAction(fighter, actionID) {
  const skill = SKILLS_BY_ACTION_ID[actionID];
  if(!skill) {
    return false;
  }
  return skill.requires(fighter.stats || {});
}

function normalizeMessage(message) {
  if(!message) {
    return null;
  }
  const actionID = Number(message.action_id);
  if(!Number.isInteger(actionID)) {
    return null;
  }
  return {
    action_id: actionID,
  };
}
