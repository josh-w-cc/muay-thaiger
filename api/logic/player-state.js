import {authenticate} from './auth.js';
import {applyTraining} from './training.js';

export async function applyTrainingAndSend({fighterActions, fighters}, socket) {
  const fighter = await fighters.findCurrentByPlayerID(socket.player.id);
  if(!fighter) {
    return;
  }
  const {actions, fighter: updatedFighter} = await applyTraining({fighterActions, fighters}, fighter);
  sendPlayerState(actions, updatedFighter, socket);
}

export async function authenticateAndSendPlayerState(models, message, socket) {
  await authenticate(models, message, socket);
  if(!canSendPlayerStateOnAuth(models, socket)) {
    return;
  }
  await applyTrainingAndSend(models, socket);
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
