import {SKILL_DEFINITIONS, SKILL_IDS} from 'shared/skills.js';

const SKILLS_BY_ACTION_ID = Object.freeze(
  Object.fromEntries(
    Object.entries(SKILL_IDS).map(([skillKey, id]) => [id, SKILL_DEFINITIONS[skillKey]]),
  ),
);

export async function registerFighterAction({fighterActions, fighters}, message, socket) {
  const normalizedMessage = normalizeMessage(message);
  if(!normalizedMessage || !isSocketReady(socket)) {
    return;
  }
  const currentFighter = await fighters.findCurrentByPlayerID(socket.player.id);
  if(!currentFighter || !isValidAction(currentFighter, normalizedMessage.action_id)) {
    return;
  }
  const fighterAction = await fighterActions.create({
    action_id: normalizedMessage.action_id,
    fighter_id: currentFighter.id,
  });
  socket.send(JSON.stringify({
    cmd: 'ok',
    metadata: {fighterAction, responded_cmd: 'idle'},
  }));
}

function isSocketReady(socket) {
  return socket.player && socket.readyState === socket.OPEN;
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
