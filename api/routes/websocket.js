import {AsyncTask, SimpleIntervalJob, ToadScheduler} from 'toad-scheduler';

import fightersModel from '../data/models/fighters.js';
import fighterActionsModel from '../data/models/fighter-actions.js';
import playersModel from '../data/models/players.js';
import racesModel from '../data/models/races.js';
import {authenticateAndSendPlayerState, applyTrainingAndSend} from '../logic/player-state.js';
import {registerFighterAction} from '../logic/fighter-actions.js';

export default async function websocketRoutes(app) {
  const connections = new Set();
  const models = {fighterActions: fighterActionsModel(app.db), fighters: fightersModel(app.db), players: playersModel(app.db), races: racesModel(app.db)};
  const stateSyncScheduler = createPlayerStateSyncScheduler(models, connections, app.log);
  app.addHook('onClose', () => stateSyncScheduler.stop());
  app.get('/connect', {websocket: true}, (socket) => onConnect(socket, models, connections));
}

export function onConnect(socket, models, connections = null) {
  if(connections) {
    connections.add(socket);
    socket.on('close', () => connections.delete(socket));
  }
  socket.on('message', (raw) => onMessage(raw, socket, models));
  setImmediate(() => {
    if(isSocketOpen(socket)) {
      socket.send(JSON.stringify({cmd: 'auth'}));
    }
  });
}

export async function onMessage(raw, socket, models) {
  const message = parseMessage(raw);
  if(!message || socket.readyState !== socket.OPEN) {
    return;
  }
  try {
    await processMessageCommand(models, message, socket);
  }
  catch(error) {
    sendSocketError(socket, resolveCommandError(error));
  }
}

export async function syncPlayerState({fighterActions, fighters}, sockets) {
  for(const socket of sockets) {
    if(!isSocketOpen(socket)) {
      sockets.delete(socket);
      continue;
    }
    if(!socket.player) {
      continue;
    }
    await applyTrainingAndSend({fighterActions, fighters}, socket);
  }
}

function createPlayerStateSyncScheduler(models, connections, logger) {
  const scheduler = new ToadScheduler();
  const task = new AsyncTask(
    'sync-player-state',
    () => syncPlayerState(models, connections),
    (error) => logger.error({err: error}, 'sync-player-state failed'),
  );
  const job = new SimpleIntervalJob({minutes: 1}, task);
  scheduler.addSimpleIntervalJob(job);
  return scheduler;
}

function isSocketOpen(socket) {
  return socket.readyState === socket.OPEN;
}

function parseMessage(raw) {
  try {
    return JSON.parse(raw);
  }
  catch {
    return null;
  }
}

async function processMessageCommand(models, message, socket) {
  switch(message.cmd) {
    case 'auth':
      return authenticateAndSendPlayerState(models, message, socket);
    case 'idle':
      return registerFighterAction(models, message, socket);
    default:
      sendSocketError(socket, 'invalid-cmd');
  }
}

function sendSocketError(socket, error) {
  if(!isSocketOpen(socket)) {
    return;
  }
  socket.send(error === 'auth-invalid-token'
    ? JSON.stringify({cmd: 'auth-invalid-token'})
    : JSON.stringify({cmd: 'error', error}));
}

function resolveCommandError(error) {
  return error?.code || 'internal-error';
}
