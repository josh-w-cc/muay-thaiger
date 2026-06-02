import fightersModel from '../data/models/fighters.js';
import fighterActionsModel from '../data/models/fighter-actions.js';
import fighterMovesModel from '../data/models/fighter-moves.js';
import fightsModel from '../data/models/fights.js';
import playersModel from '../data/models/players.js';
import racesModel from '../data/models/races.js';
import {processMessageCommand} from '../logic/websocket-commands.js';


export default async function websocketRoutes(app) {
  const connections = app.websocketConnections;
  const models = {
    fighterActions: fighterActionsModel(app.db),
    fightJudge: app.fightJudge,
    fighterMoves: fighterMovesModel(app.db),
    fighters: fightersModel(app.db),
    fights: fightsModel(app.db),
    players: playersModel(app.db),
    races: racesModel(app.db),
  };
  app.get('/connect', {websocket: true}, (socket) => onConnect(socket, models, connections));
}

export function onConnect(socket, models, connections) {
  connections.add(socket);
  socket.on('close', () => connections.delete(socket));
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

function sendSocketError(socket, error) {
  if(!isSocketOpen(socket)) {
    return;
  }
  socket.send(error === 'auth-invalid-token'
    ? JSON.stringify({cmd: 'auth-invalid-token'})
    : JSON.stringify({cmd: 'error', error}));
}
