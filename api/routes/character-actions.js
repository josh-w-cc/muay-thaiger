import characterActionsModel from '../data/models/character-actions.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function characterActionsRoutes(app) {
  const characterActions = characterActionsModel(app.db);
  app.get('/character-actions', {websocket: true}, (socket) => onConnect(socket, characterActions));
}

export function onConnect(socket, characterActions) {
  socket.on('message', (raw) => onMessage(raw, socket, characterActions));
}

export async function onMessage(raw, socket, characterActions) {
  const message = parseMessage(raw);
  if(!isValidMessage(message) || socket.readyState !== socket.OPEN) {
    return;
  }
  const characterAction = await characterActions.create({
    action_id: message.action_id,
    character_id: message.character_id,
  });
  socket.send(JSON.stringify({characterAction, type: 'character_action'}));
}

function isValidMessage(message) {
  return message && message.type === 'create'
    && Number.isInteger(message.action_id) && Number.isInteger(message.character_id);
}

function parseMessage(raw) {
  try {
    return JSON.parse(raw);
  }
  catch{
    return null;
  }
}
