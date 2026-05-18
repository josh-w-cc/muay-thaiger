import charactersModel from '../data/models/characters.js';
import characterActionsModel from '../data/models/character-actions.js';
import playersModel from '../data/models/players.js';
import {AsyncTask, SimpleIntervalJob, ToadScheduler} from 'toad-scheduler';
import {authenticate} from '../logic/auth.js';
import {createAndSend} from '../logic/character-actions.js';

const PLAYER_SYNC_INTERVAL_MINUTES = 1;

export default async function connectRoutes(app) {
  const activeSockets = new Set();
  const models = {
    characterActions: characterActionsModel(app.db),
    characters: charactersModel(app.db),
    players: playersModel(app.db),
  };
  const scheduler = createScheduler(activeSockets, models);

  app.addHook('onClose', () => {
    scheduler.stop();
  });
  app.get('/connect', {websocket: true}, (socket) => onConnect(socket, activeSockets, models));
}

export function onConnect(socket, activeSockets, models) {
  activeSockets.add(socket);
  socket.on('close', () => activeSockets.delete(socket));
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

export async function syncCharacterState(activeSockets, {characters}) {
  for(const socket of activeSockets) {
    if(socket.readyState !== socket.OPEN || !Number.isInteger(socket.playerID)) {
      continue;
    }
    const character = await characters.findCurrentByPlayerID(socket.playerID);
    if(!character) {
      continue;
    }
    socket.send(JSON.stringify({character, type: 'character_state'}));
  }
}

async function onAuthCmd(message, socket, models) {
  if(typeof message.token !== 'string') {
    return;
  }
  const player = await authenticate(models, message, socket);
  if(player) {
    socket.playerID = player.id;
  }
}

function createScheduler(activeSockets, models) {
  const scheduler = new ToadScheduler();
  const task = new AsyncTask(
    'sync-player-state',
    () => syncCharacterState(activeSockets, models),
    () => {},
  );
  const syncJob = new SimpleIntervalJob(
    {minutes: PLAYER_SYNC_INTERVAL_MINUTES},
    task,
  );
  scheduler.addSimpleIntervalJob(syncJob);
  return scheduler;
}

function parseMessage(raw) {
  try {
    return JSON.parse(raw);
  }
  catch{
    return null;
  }
}
