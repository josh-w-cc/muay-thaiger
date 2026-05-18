import {randomUUID} from 'node:crypto';
import charactersModel from '../data/models/characters.js';
import playersModel from '../data/models/players.js';

const TOKEN_PREVIEW_LENGTH = 8;

export default async function connectRoutes(app) {
  const characters = charactersModel(app.db);
  const players = playersModel(app.db);
  app.get('/connect', {websocket: true}, (socket) => onConnect(socket, characters, players));
}

export function onConnect(socket, characters, players) {
  socket.on('message', (raw) => onMessage(raw, socket, characters, players));
  setImmediate(() => {
    if(socket.readyState !== socket.OPEN) {
      return;
    }
    socket.send(JSON.stringify({type: 'auth'}));
  });
}

export async function onMessage(raw, socket, characters, players) {
  const message = parseMessage(raw);
  if(!message || message.type !== 'auth' || message.token !== 'new') {
    return;
  }
  const race = getRace(message);
  if(!canCreatePlayer({socket, race})) {
    return;
  }
  const token = randomUUID();
  const player = await players.create({display_name: `Player-${token.slice(0, TOKEN_PREVIEW_LENGTH)}`, token});
  await createCharacter({characters, player, race});
  socket.send(JSON.stringify({token: player.token, type: 'auth'}));
}

function canCreatePlayer({socket, race}) {
  return socket.readyState === socket.OPEN && race !== null;
}

function parseMessage(raw) {
  try {
    return JSON.parse(raw);
  }
  catch{
    return null;
  }
}

function getRace(message) {
  if(message.race == null) {
    return null;
  }
  const parsedRace = Number.parseInt(message.race, 10);
  if(!Number.isInteger(parsedRace) || parsedRace <= 0) {
    return null;
  }
  return parsedRace;
}

async function createCharacter({characters, player, race}) {
  return characters.create({display_name: `${player.display_name} Jr`, player_id: player.id, race});
}
