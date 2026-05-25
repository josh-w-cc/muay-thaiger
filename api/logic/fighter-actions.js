import {SKILLS_BY_ACTION_ID} from 'shared/skills.js';
import {createCommandError} from './command-errors.js';

export async function registerFighterAction({fighterActions, fighters}, message, playerID) {
  const normalizedMessage = normalizeMessage(message, 'invalid-idle-message');
  const currentFighter = await fighters.findCurrentByPlayerID(playerID);
  if(!currentFighter || !isValidAction(currentFighter, normalizedMessage.action_id)) {
    throw createCommandError('invalid-idle-message');
  }
  const currentActions = await fighterActions.listByFighterID(currentFighter.id);
  const touchedAt = getNextTouchedAt(currentActions);
  const action = {
    action_id: normalizedMessage.action_id,
    fighter_id: currentFighter.id,
  };
  if(touchedAt) {
    action.touched_at = touchedAt;
  }
  return await fighterActions.create(action);
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

function getNextTouchedAt(actions) {
  const touchedAtValues = actions
    .map(getTouchedAtMs)
    .filter((touchedAtMs) => touchedAtMs !== null);
  if(!touchedAtValues.length) {
    return null;
  }
  return new Date(Math.max(...touchedAtValues) + 1);
}

function getTouchedAtMs(action) {
  const touchedAtMs = Date.parse(action.touched_at);
  if(Number.isNaN(touchedAtMs)) {
    return null;
  }
  return touchedAtMs;
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
