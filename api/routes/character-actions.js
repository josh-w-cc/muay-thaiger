import charactersModel from '../data/models/characters.js';
import characterActionsModel from '../data/models/character-actions.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function characterActionsRoutes(app) {
  const characterActions = characterActionsModel(app.db);
  const characters = charactersModel(app.db);
  app.get('/character-actions', {websocket: true}, (socket) => onConnect(socket, characterActions, characters));
}

export function onConnect(socket, characterActions, characters) {
  socket.on('message', (raw) => onMessage(raw, socket, characterActions, characters));
}

export async function onMessage(raw, socket, characterActions, characters) {
  const message = parseMessage(raw);
  const normalizedMessage = normalizeMessage(message);
  if(!normalizedMessage || socket.readyState !== socket.OPEN) {
    return;
  }
  const currentCharacter = await characters.findCurrentByPlayerID(normalizedMessage.player_id);
  if(!currentCharacter) {
    return;
  }
  const characterAction = await characterActions.create({
    action_id: normalizedMessage.action_id,
    character_id: currentCharacter.id,
  });
  socket.send(JSON.stringify({characterAction, type: 'character_action'}));
}

function normalizeMessage(message) {
  if(!message || message.type !== 'create') {
    return null;
  }
  const actionID = Number(message.action_id);
  const playerID = Number(message.player_id);
  if(!Number.isInteger(actionID) || !Number.isInteger(playerID)) {
    return null;
  }
  return {
    action_id: actionID,
    player_id: playerID,
    type: message.type,
  };
}

function parseMessage(raw) {
  try {
    return JSON.parse(raw);
  }
  catch{
    return null;
  }
}
