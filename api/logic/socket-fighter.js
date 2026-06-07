export async function attachCurrentFighter(socket, fighters, playerID) {
  const fighter = await fighters.findCurrentByPlayerID(playerID);
  if(!fighter) {
    delete socket.fighter;
    return;
  }
  socket.fighter = fighter;
}
