import {randomUUID} from 'node:crypto';
import {SimpleIntervalJob, Task, ToadScheduler} from 'toad-scheduler';
import charactersModel from '../data/models/characters.js';
import playersModel from '../data/models/players.js';

const TOKEN_PREVIEW_LENGTH = 8;
const SYNC_PLAYER_STATE_INTERVAL_MINUTES = 1;
const SYNC_PLAYER_STATE_JOB_ID = 'sync-player-state';

export default async function connectRoutes(app) {
  const characters = charactersModel(app.db);
  const players = playersModel(app.db);
  const sockets = new Set();
  const scheduler = createScheduler(characters, sockets);

  app.addHook('onClose', async () => {
    scheduler.stop();
  });
  app.get('/connect', {websocket: true}, (socket) => onConnect(socket, characters, players, sockets));
}

export function onConnect(socket, characters, players, sockets = new Set()) {
  sockets.add(socket);
  socket.on('close', () => sockets.delete(socket));
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
  if(!message || message.type !== 'auth') {
    return;
  }
  if(socket.readyState !== socket.OPEN) {
    return;
  }
  const player = await getPlayer({characters, players}, message.token, message.race);
  if(!player) {
    return;
  }
  socket.playerID = player.id;
  socket.send(JSON.stringify({player_id: player.id, token: player.token, type: 'auth'}));
}

export async function syncPlayerState(characters, sockets) {
  for(const socket of sockets) {
    if(socket.readyState !== socket.OPEN || !Number.isInteger(socket.playerID)) {
      continue;
    }
    const character = await characters.findCurrentByPlayer(socket.playerID);
    if(!character) {
      continue;
    }
    socket.send(JSON.stringify({character, type: 'character_state'}));
  }
}

function parseMessage(raw) {
  try {
    return JSON.parse(raw);
  }
  catch{
    return null;
  }
}

async function getPlayer({characters, players}, token, race) {
  if(token === 'new') {
    return createPlayer({characters, players}, race);
  }
  if(typeof token !== 'string') {
    return null;
  }
  return players.findByToken(token);
}

async function createPlayer({characters, players}, race) {
  const raceID = Number(race);
  if(!Number.isInteger(raceID) || raceID < 1) {
    return null;
  }
  const token = randomUUID();
  const player = await players.create({display_name: `Player-${token.slice(0, TOKEN_PREVIEW_LENGTH)}`, token});
  await characters.create({display_name: player.display_name, player_id: player.id, race: raceID});
  return player;
}

function createScheduler(characters, sockets) {
  const scheduler = new ToadScheduler();
  const task = new Task(SYNC_PLAYER_STATE_JOB_ID, () => syncPlayerState(characters, sockets));
  const interval = {minutes: SYNC_PLAYER_STATE_INTERVAL_MINUTES};
  const job = new SimpleIntervalJob(interval, task, {id: SYNC_PLAYER_STATE_JOB_ID, preventOverrun: true});
  scheduler.addSimpleIntervalJob(job);
  return scheduler;
}
