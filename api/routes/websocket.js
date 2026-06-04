import fightersModel from '../data/models/fighters.js';
import fighterActionsModel from '../data/models/fighter-actions.js';
import fighterMovesModel from '../data/models/fighter-moves.js';
import fightsModel from '../data/models/fights/index.js';
import playersModel from '../data/models/players.js';
import racesModel from '../data/models/races.js';
import {processMessageCommand} from '../logic/websocket-commands.js';


export default async function websocketRoutes(app) {
  const connections = app.websocketConnections;
  const logger = app.log;
  const models = {
    fighterActions: fighterActionsModel(app.db),
    fighterMoves: fighterMovesModel(app.db),
    fighters: fightersModel(app.db),
    fights: fightsModel(app.db),
    fightJudge: app.fightJudge,
    players: playersModel(app.db),
    races: racesModel(app.db),
  };
  app.get('/connect', {websocket: true}, (socket) => onConnect(socket, models, connections, logger));
}

export function onConnect(socket, models, connections, logger) {
  connections.add(socket);
  logWebSocketActivity(logger, 'info', {connection_count: connections.size}, 'websocket connected');
  socket.on('close', () => {
    connections.delete(socket);
    logWebSocketActivity(logger, 'info', {connection_count: connections.size}, 'websocket disconnected');
  });
  socket.on('message', (raw) => onMessage(raw, socket, models, logger));
  setImmediate(() => {
    if(isSocketOpen(socket)) {
      logWebSocketActivity(logger, 'debug', {cmd: 'auth'}, 'websocket send');
      socket.send(JSON.stringify({cmd: 'auth'}));
    }
  });
}

export async function onMessage(raw, socket, models, logger) {
  const message = parseMessageIfActive(raw, socket, logger);
  if(!message) {
    return;
  }
  try {
    await processMessageCommand(models, message, socket);
  }
  catch(error) {
    logWebSocketActivity(logger, 'error', {cmd: message.cmd, err: error, player_id: getSocketPlayerID(socket)}, 'websocket command failed');
    sendSocketError(socket, resolveCommandError(error));
  }
}

function parseMessageIfActive(raw, socket, logger) {
  const message = parseMessage(raw);
  if(!message) {
    logWebSocketActivity(logger, 'warn', {raw_type: typeof raw}, 'websocket invalid message');
    return null;
  }
  if(!isSocketOpen(socket)) {
    logWebSocketActivity(logger, 'debug', {cmd: message.cmd}, 'websocket ignored message');
    return null;
  }
  logWebSocketActivity(logger, 'debug', {cmd: message.cmd, player_id: getSocketPlayerID(socket)}, 'websocket received');
  return message;
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

function resolveCommandError(error) {
  return error?.code || 'internal-error';
}

function getSocketPlayerID(socket) {
  return socket.player && Number.isInteger(socket.player.id) ? socket.player.id : null;
}

function logWebSocketActivity(logger, level, ...args) {
  if(!logger || typeof logger[level] !== 'function') {
    return;
  }
  logger[level](...args);
}

function sendSocketError(socket, error) {
  if(!isSocketOpen(socket)) {
    return;
  }
  socket.send(error === 'auth-invalid-token'
    ? JSON.stringify({cmd: 'auth-invalid-token'})
    : JSON.stringify({cmd: 'error', error}));
}
