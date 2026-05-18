export async function createAndSend({characterActions, fighters}, message, socket) {
  const normalizedMessage = normalizeMessage(message);
  if(!normalizedMessage || !socket.player || socket.readyState !== socket.OPEN) {
    return;
  }
  const currentFighter = await fighters.findCurrentByPlayerID(socket.player.id);
  if(!currentFighter) {
    return;
  }
  const characterAction = await characterActions.create({
    action_id: normalizedMessage.action_id,
    character_id: currentFighter.id,
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
