export async function syncCharacterState(activeSockets, {characters}) {
  for(const socket of activeSockets) {
    if(socket.readyState !== socket.OPEN || !Number.isInteger(socket.playerID)) {
      continue;
    }
    const character = await characters.findCurrentByPlayerID(socket.playerID);
    if(!character) {
      continue;
    }
    socket.send(JSON.stringify({character, type: 'character_state'}));
  }
}
