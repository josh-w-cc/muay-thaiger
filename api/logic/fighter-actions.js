export async function createAndSend({characterActions, characters}, message, socket) {
  const normalizedMessage = normalizeMessage(message);
  if(!normalizedMessage || !socket.player || socket.readyState !== socket.OPEN) {
    return;
  }
  const currentCharacter = await characters.findCurrentByPlayerID(socket.player.id);
  if(!currentCharacter) {
    return;
  }
  const characterAction = await characterActions.create({
    action_id: normalizedMessage.action_id,
    character_id: currentCharacter.id,
  });
  socket.send(JSON.stringify({characterAction, type: 'character_action'}));
}

function normalizeMessage(message) {
  if(!message) {
    return null;
  }
  const actionId = Number(message.action_id);
  if(!Number.isInteger(actionId)) {
    return null;
  }
  return {
    action_id: actionId,
  };
}
