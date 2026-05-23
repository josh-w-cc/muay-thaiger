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
