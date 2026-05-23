import {applyTraining} from './training.js';

export async function applyOfflineTraining({fighterActions, fighters}) {
  const staleBefore = new Date(Date.now() - 60 * 60 * 1000);
  const staleActions = await fighterActions.listStaleBefore(staleBefore);
  const fighterIDs = [...new Set(staleActions.map(({fighter_id: fighterID}) => fighterID))];
  for(const fighterID of fighterIDs) {
    const fighter = await fighters.find(fighterID);
    if(!fighter || fighter.retired) {
      continue;
    }
    await getPlayerState({fighterActions, fighters}, fighter.player_id);
  }
}

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
