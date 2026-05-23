import {applyTraining} from './training.js';

export async function getPlayerState({fighterActions, fighters}, playerID) {
  const fighter = await fighters.findCurrentByPlayerID(playerID);
  if(!fighter) {
    return null;
  }
  const {actions, fighter: updatedFighter} = await applyTraining({fighterActions, fighters}, fighter);
  return {actions, fighter: updatedFighter};
}

export function sendPlayerState(actions, fighter, socket) {
  socket.send(JSON.stringify({actions, cmd: 'player_state', fighter}));
}

export async function syncPlayerState({fighterActions, fighters}, sockets) {
  for(const socket of sockets) {
    if(!isSocketOpen(socket)) {
      sockets.delete(socket);
      continue;
    }
    if(!socket.player) {
      continue;
    }
    const state = await getPlayerState({fighterActions, fighters}, socket.player.id);
    if(state) {
      sendPlayerState(state.actions, state.fighter, socket);
    }
  }
}

function isSocketOpen(socket) {
  return socket.readyState === socket.OPEN;
}
