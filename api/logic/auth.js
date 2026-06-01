import {randomUUID} from 'node:crypto';
import {MOVE_IDS} from 'shared/moves.js';
import {createCommandError} from './command-errors.js';

const TOKEN_PREVIEW_LENGTH = 8;

export async function authenticate({fighterMoves, fighters, players, races}, message) {
  const player = await getPlayer({fighterMoves, fighters, players, races}, message.token, message.race);
  if(!player) {
    throw createCommandError('auth-invalid-token');
  }
  return player;
}

async function getPlayer({fighterMoves, fighters, players, races}, token, race) {
  if(token === 'new') {
    return createPlayer({fighterMoves, fighters, players, races}, race);
  }
  if(typeof token !== 'string') {
    throw createCommandError('auth-invalid-token');
  }
  return players.findByToken(token);
}

async function createPlayer({fighterMoves, fighters, players, races}, race) {
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
  const fighter = await fighters.create({
    display_name: player.display_name,
    player: player.id,
    race: raceID,
    stats: {...raceData.stats},
  });
  await enableStarterMoves(fighterMoves, fighter.id);
  return player;
}

function enableStarterMoves(fighterMoves, fighterID) {
  return Promise.all([
    fighterMoves.create({enabled: true, fighter: fighterID, move: MOVE_IDS.wildPunch}),
    fighterMoves.create({enabled: true, fighter: fighterID, move: MOVE_IDS.wildKick}),
  ]);
}
