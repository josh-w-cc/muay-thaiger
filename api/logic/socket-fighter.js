export async function attachCurrentFighter(socket, fighters, playerID) {
  if(typeof fighters?.findCurrentByPlayerID !== 'function') {
    delete socket.fighter;
    return;
  }
  const fighter = await fighters.findCurrentByPlayerID(playerID);
  if(!fighter) {
    delete socket.fighter;
    return;
  }
  socket.fighter = fighter;
}

export function getSocketFighterID(socket) {
  return socket.fighter && Number.isInteger(socket.fighter.id) ? socket.fighter.id : null;
}
