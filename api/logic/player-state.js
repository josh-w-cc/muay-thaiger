import {authenticate} from './auth.js';

export async function authenticateAndSendPlayerState(models, message, socket) {
  await authenticate(models, message, socket);
  if(!canSendPlayerStateOnAuth(models, socket)) {
    return;
  }
  const fighter = await models.fighters.findCurrentByPlayerID(socket.player.id);
  if(!fighter) {
    return;
  }
  const actions = await models.fighterActions.listByFighterID(fighter.id);
  sendPlayerState(actions, fighter, socket);
}

export function sendPlayerState(actions, fighter, socket) {
  socket.send(JSON.stringify({actions, cmd: 'player_state', fighter}));
}

function canSendPlayerStateOnAuth({fighterActions, fighters}, socket) {
  return Boolean(
    socket.player
    && fighterActions?.listByFighterID
    && fighters?.findCurrentByPlayerID,
  );
}
