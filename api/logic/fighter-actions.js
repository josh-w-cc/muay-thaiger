import {SKILL_DEFINITIONS, SKILL_IDS} from 'shared/skills.js';
import {createCommandError} from './command-errors.js';

const SKILLS_BY_ACTION_ID = Object.freeze(
  Object.fromEntries(
    Object.entries(SKILL_IDS).map(([skillKey, id]) => [id, SKILL_DEFINITIONS[skillKey]]),
  ),
);

export async function registerFighterAction({fighterActions, fighters}, message, playerID) {
  const normalizedMessage = normalizeMessage(message, 'invalid-idle-message');
  const currentFighter = await fighters.findCurrentByPlayerID(playerID);
  if(!currentFighter || !isValidAction(currentFighter, normalizedMessage.action_id)) {
    throw createCommandError('invalid-idle-message');
  }
  return await fighterActions.create({
    action_id: normalizedMessage.action_id,
    fighter_id: currentFighter.id,
  });
}

export async function unregisterFighterAction({fighterActions, fighters}, message, playerID) {
  const normalizedMessage = normalizeMessage(message, 'invalid-stop-message');
  const currentFighter = await fighters.findCurrentByPlayerID(playerID);
  if(!currentFighter) {
    throw createCommandError('invalid-stop-message');
  }
  const actions = await fighterActions.listByFighterID(currentFighter.id);
  const matchingActions = actions.filter((action) => action.action_id === normalizedMessage.action_id);
  await Promise.all(matchingActions.map((action) => fighterActions.remove(action.id)));
  return {action_id: normalizedMessage.action_id};
}

function isValidAction(fighter, actionID) {
  const skill = SKILLS_BY_ACTION_ID[actionID];
  if(!skill) {
    return false;
  }
  return skill.requires(fighter.stats || {});
}

function normalizeMessage(message, errorCode) {
  if(!message) {
    throw createCommandError(errorCode);
  }
  const actionID = Number(message.action_id);
  if(!Number.isInteger(actionID)) {
    throw createCommandError(errorCode);
  }
  return {
    action_id: actionID,
  };
}
