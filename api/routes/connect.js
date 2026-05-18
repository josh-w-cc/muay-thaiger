import fightersModel from '../data/models/fighters.js';
import characterActionsModel from '../data/models/character-actions.js';
import playersModel from '../data/models/players.js';
import {authenticate} from '../logic/auth.js';
import {createAndSend} from '../logic/character-actions.js';

export default async function connectRoutes(app) {
  const models = {
    characterActions: characterActionsModel(app.db),
    characters: fightersModel(app.db),
    players: playersModel(app.db),
  };
  app.get('/connect', {websocket: true}, (socket) => onConnect(socket, models));
}

export function onConnect(socket, models) {
  socket.on('message', (raw) => onMessage(raw, socket, models));
  setImmediate(() => {
    if(socket.readyState !== socket.OPEN) {
      return;
    }
    socket.send(JSON.stringify({type: 'auth'}));
  });
}

export async function onMessage(raw, socket, models) {
  const message = parseMessage(raw);
  if(!message || socket.readyState !== socket.OPEN) {
    return;
  }
  switch(message.cmd) {
    case 'auth':
      return onAuthCmd(message, socket, models);
    case 'create':
      return createAndSend(models, message, socket);
    default:
      socket.send(JSON.stringify({error: 'invalid-cmd', type: 'error'}));
  }
}

function onAuthCmd(message, socket, models) {
  if(typeof message.token !== 'string') {
    return;
  }
  return authenticate(models, message, socket);
}

function parseMessage(raw) {
  try {
    return JSON.parse(raw);
  }
  catch{
    return null;
  }
}
