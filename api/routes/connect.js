import charactersModel from '../data/models/characters.js';
import characterActionsModel from '../data/models/character-actions.js';
import playersModel from '../data/models/players.js';
import {AsyncTask, SimpleIntervalJob, ToadScheduler} from 'toad-scheduler';
import {authenticate} from '../logic/auth.js';
import {createAndSend} from '../logic/character-actions.js';
import {syncCharacterState} from '../logic/player-state-sync.js';

const PLAYER_SYNC_INTERVAL_MINUTES = 1;

export default async function connectRoutes(app) {
  const activeSockets = new Set();
  const models = {
    characterActions: characterActionsModel(app.db),
    characters: charactersModel(app.db),
    log: app.log,
    players: playersModel(app.db),
  };
  const scheduler = createPlayerStateSyncScheduler(
    activeSockets,
    models,
    (error) => app.log.error(error, 'sync-player-state failed'),
  );

  app.addHook('onClose', () => {
    scheduler.stop();
  });
  app.get('/connect', {websocket: true}, (socket) => onConnect(socket, activeSockets, models));
}

export function onConnect(socket, activeSockets, models) {
  if(socket.readyState === socket.OPEN) {
    activeSockets.add(socket);
  }
  const removeSocket = () => activeSockets.delete(socket);
  socket.on('close', removeSocket);
  socket.on('error', removeSocket);
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

async function onAuthCmd(message, socket, models) {
  if(typeof message.token !== 'string') {
    return;
  }
  try {
    const player = await authenticate(models, message, socket);
    if(player) {
      socket.playerID = player.id;
    }
  }
  catch(error) {
    models.log?.error(error, 'auth command failed');
  }
}

function createPlayerStateSyncScheduler(activeSockets, models, onError) {
  const scheduler = new ToadScheduler();
  const task = new AsyncTask(
    'sync-player-state',
    () => syncCharacterState(activeSockets, models),
    onError,
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
