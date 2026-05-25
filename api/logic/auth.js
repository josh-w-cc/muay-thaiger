import {randomUUID} from 'node:crypto';
import {createCommandError} from './command-errors.js';

const TOKEN_PREVIEW_LENGTH = 8;
const DEFAULT_TRAINING_STATS = {
  agility: 0,
  constitution: 0,
  skill: 0,
  stamina: 0,
  strength: 0,
};

export async function authenticate({fighters, players, races}, message) {
  const player = await getPlayer({fighters, players, races}, message.token, message.race);
  if(!player) {
    throw createCommandError('auth-invalid-token');
  }
  return player;
}

async function getPlayer({fighters, players, races}, token, race) {
  if(token === 'new') {
    return createPlayer({fighters, players, races}, race);
  }
  if(typeof token !== 'string') {
    throw createCommandError('auth-invalid-token');
  }
  return players.findByToken(token);
}

async function createPlayer({fighters, players, races}, race) {
  const raceID = Number(race);
  if(!Number.isInteger(raceID) || raceID < 1) {
    throw createCommandError('invalid-auth-data');
  }
  const raceData = await races.find(raceID);
  if(!raceData) {
    throw createCommandError('invalid-auth-data');
  }
  const token = randomUUID();
  const player = await players.create({display_name: `Player-${token.slice(0, TOKEN_PREVIEW_LENGTH)}`, token});
  await fighters.create({
    display_name: player.display_name,
    player: player.id,
    race: raceID,
    stats: getDefaultStats(raceData),
  });
  return player;
}

function getDefaultStats({stats = {}}) {
  return {...DEFAULT_TRAINING_STATS, ...stats};
}
