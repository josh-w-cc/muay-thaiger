export async function createAndSend({characterActions, characters}, message, socket) {
  const normalizedMessage = normalizeMessage(message);
  if(!normalizedMessage || socket.readyState !== socket.OPEN) {
    return;
  }
  const currentCharacter = await characters.findCurrentByPlayerID(normalizedMessage.player_id);
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
  if(!message || message.cmd !== 'create') {
    return null;
  }
  const actionId = Number(message.action_id);
  const playerId = Number(message.player_id);
  if(!Number.isInteger(actionId) || !Number.isInteger(playerId)) {
    return null;
  }
  return {
    action_id: actionId,
    cmd: message.cmd,
    player_id: playerId,
  };
}
