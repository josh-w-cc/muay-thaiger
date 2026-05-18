import {randomUUID} from 'node:crypto';

const TOKEN_PREVIEW_LENGTH = 8;

export async function authenticate({characters, players}, message, socket) {
  const player = await getPlayer({characters, players}, message.token, message.race);
  if(!player) {
    if(message.token !== 'new') {
      socket.send(JSON.stringify({type: 'auth-invalid-token'}));
    }
    return null;
  }
  socket.player = player;
  socket.send(JSON.stringify({player_id: player.id, token: player.token, type: 'auth'}));
  return player;
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
