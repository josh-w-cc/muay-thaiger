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
  if(!canHandleAuthMessage({message, socket})) {
    return;
  }
  const player = await getPlayer(message.token, players);
  if(!player) {
    socket.send(JSON.stringify({type: 'auth-invalid-token'}));
    return;
  }
  socket.send(JSON.stringify({player_id: player.id, token: player.token, type: 'auth'}));
}

function parseMessage(raw) {
  try {
    return JSON.parse(raw);
  }
  catch{
    return null;
  }
}

function canHandleAuthMessage({message, socket}) {
  return Boolean(
    message
    && message.type === 'auth'
    && socket.readyState === socket.OPEN
    && typeof message.token === 'string',
  );
}

async function getPlayer(token, players) {
  if(token === 'new') {
    return createPlayer(players);
  }
  if(typeof token !== 'string') {
    return null;
  }
  return players.findByToken(token);
}

async function createPlayer(players) {
  const token = randomUUID();
  return players.create({display_name: `Player-${token.slice(0, TOKEN_PREVIEW_LENGTH)}`, token});
}
