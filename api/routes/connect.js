import charactersModel from '../data/models/characters.js';
import characterActionsModel from '../data/models/character-actions.js';
import playersModel from '../data/models/players.js';
import {authenticate, canHandleAuthMessage} from '../logic/auth.js';
import {onMessage as onCharacterActionsMessage} from './character-actions.js';

export default async function connectRoutes(app) {
  const characterActions = characterActionsModel(app.db);
  const characters = charactersModel(app.db);
  const players = playersModel(app.db);
  app.get('/connect', {websocket: true}, (socket) => onConnect(socket, characterActions, characters, players));
}

export function onConnect(socket, characterActions, characters, players) {
  socket.on('message', (raw) => onMessage(raw, socket, characterActions, characters, players));
  setImmediate(() => {
    if(socket.readyState !== socket.OPEN) {
      return;
    }
    socket.send(JSON.stringify({type: 'auth'}));
  });
}

export async function onMessage(raw, socket, characterActions, characters, players) {
  const message = parseMessage(raw);
  if(canHandleAuthMessage({message, socket})) {
    return authenticate({characters, players}, message, socket);
  }
  return onCharacterActionsMessage(raw, socket, characterActions, characters);
}

function parseMessage(raw) {
  try {
    return JSON.parse(raw);
  }
  catch{
    return null;
  }
}
