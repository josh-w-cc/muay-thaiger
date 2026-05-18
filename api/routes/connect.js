import {randomUUID} from 'node:crypto';
import playersModel from '../data/models/players.js';

const TOKEN_PREVIEW_LENGTH = 8;

export default async function connectRoutes(app) {
  const players = playersModel(app.db);
  app.get('/connect', {websocket: true}, (socket) => onConnect(socket, players));
}

export function onConnect(socket, players) {
  socket.on('message', (raw) => onMessage(raw, socket, players));
  setImmediate(() => {
    if(socket.readyState !== socket.OPEN) {
      return;
    }
    socket.send(JSON.stringify({type: 'auth'}));
  });
}

export async function onMessage(raw, socket, players) {
  const message = parseMessage(raw);
  if(!message || message.type !== 'auth' || message.token !== 'new') {
    return;
  }
  if(socket.readyState !== socket.OPEN) {
    return;
  }
  const token = randomUUID();
  const player = await players.create({display_name: `Player-${token.slice(0, TOKEN_PREVIEW_LENGTH)}`, token});
  socket.send(JSON.stringify({token: player.token, type: 'auth'}));
}

function parseMessage(raw) {
  try {
    return JSON.parse(raw);
  }
  catch{
    return null;
  }
}
