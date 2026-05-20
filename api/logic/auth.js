import {randomUUID} from 'node:crypto';

const TOKEN_PREVIEW_LENGTH = 8;

export async function authenticate({fighters, players}, message, socket) {
  const player = await getPlayer({fighters, players}, message.token, message.race);
  if(!player) {
    if(message.token !== 'new') {
      socket.send(JSON.stringify({cmd: 'auth-invalid-token'}));
    }
    return;
  }
  socket.player = player;
  socket.send(JSON.stringify({cmd: 'auth', player_id: player.id, token: player.token}));
}

async function getPlayer({fighters, players}, token, race) {
  if(token === 'new') {
    return createPlayer({fighters, players}, race);
  }
  if(typeof token !== 'string') {
    return null;
  }
  return players.findByToken(token);
}

async function createPlayer({fighters, players}, race) {
  const raceID = Number(race);
  if(!Number.isInteger(raceID) || raceID < 1) {
    return null;
  }
  const token = randomUUID();
  const player = await players.create({display_name: `Player-${token.slice(0, TOKEN_PREVIEW_LENGTH)}`, token});
  await fighters.create({display_name: player.display_name, player_id: player.id, race: raceID});
  return player;
}
