export async function getPlayerState({fighterActions, fighters}, playerID) {
  const fighter = await fighters.findCurrentByPlayerID(playerID);
  if(!fighter) {
    return null;
  }
  const actions = await fighterActions.listByFighterID(fighter.id);
  return {actions, fighter};
}

export function sendPlayerState(actions, fighter, socket) {
  socket.send(JSON.stringify({actions, cmd: 'player_state', fighter}));
}
