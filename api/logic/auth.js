import {randomUUID} from 'node:crypto';

const TOKEN_PREVIEW_LENGTH = 8;
const DEFAULT_TRAINING_STATS = {
  agility: 0,
  constitution: 0,
  skill: 0,
  stamina: 0,
  strength: 0,
};

export async function authenticate({fighters, players, races}, message, socket) {
  const player = await getPlayer({fighters, players, races}, message.token, message.race);
  if(!player) {
    if(message.token !== 'new') {
      socket.send(JSON.stringify({cmd: 'auth-invalid-token'}));
    }
    return;
  }
  socket.player = player;
  socket.send(JSON.stringify({cmd: 'auth', display_name: player.display_name, player_id: player.id, token: player.token}));
}

async function getPlayer({fighters, players, races}, token, race) {
  if(token === 'new') {
    return createPlayer({fighters, players, races}, race);
  }
  if(typeof token !== 'string') {
    return null;
  }
  return players.findByToken(token);
}

async function createPlayer({fighters, players, races}, race) {
  const raceID = Number(race);
  if(!Number.isInteger(raceID) || raceID < 1) {
    return null;
  }
  const raceData = await races.find(raceID);
  if(!raceData) {
    return null;
  }
  const token = randomUUID();
  const player = await players.create({display_name: `Player-${token.slice(0, TOKEN_PREVIEW_LENGTH)}`, token});
  await fighters.create({
    display_name: player.display_name,
    player_id: player.id,
    race: raceID,
    stats: getDefaultStats(raceData),
  });
  return player;
}

function getDefaultStats({stats = {}}) {
  return {...DEFAULT_TRAINING_STATS, ...stats};
}
