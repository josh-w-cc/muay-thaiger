import {SKILLS_BY_ACTION_ID} from 'shared/skills.js';
import {getActionWithMaxTouchedAt, getMaxTouchedAtMs} from 'shared/training.js';
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
  const remainingActions = actions.filter((action) => action.action_id !== normalizedMessage.action_id);
  await Promise.all(matchingActions.map((action) => fighterActions.remove(action.id)));
  await transferLatestTouchedAt(fighterActions, matchingActions, remainingActions);
  return {action_id: normalizedMessage.action_id};
}

async function transferLatestTouchedAt(fighterActions, removedActions, remainingActions) {
  if(!remainingActions.length) {
    return;
  }
  const maxRemovedMs = getMaxTouchedAtMs(removedActions);
  if(maxRemovedMs === null) {
    return;
  }
  const maxRemainingMs = getMaxTouchedAtMs(remainingActions);
  if(maxRemainingMs !== null && maxRemovedMs <= maxRemainingMs) {
    return;
  }
  const targetAction = getActionWithMaxTouchedAt(remainingActions);
  await fighterActions.touch(targetAction.id, new Date(maxRemovedMs));
}

function isValidAction(fighter, actionID) {
  const skill = SKILLS_BY_ACTION_ID[actionID];
  if(!skill) {
    return false;
  }
  return skill.requires(fighter.stats || {});
}

function getNextTouchedAt(actions) {
  const maxMs = getMaxTouchedAtMs(actions);
  return maxMs !== null ? new Date(maxMs + 1) : null;
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
