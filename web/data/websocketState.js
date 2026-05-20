export function canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, selectedRace, socket, token}) {
  return isAuthHandshakePending({hasReceivedAuthRequest, hasRespondedToAuth}) && hasAuthResponseData({selectedRace, token}) && isSocketReady(socket);
}

export function getAuthResponse({selectedRace, token}) {
  if(token) {
    return {cmd: 'auth', token};
  }
  return {cmd: 'auth', race: selectedRace, token: 'new'};
}

export function parseSocketMessage(event) {
  try {
    return JSON.parse(event.data);
  }
  catch {
    return null;
  }
}

function hasAuthResponseData({selectedRace, token}) {
  return Boolean(selectedRace || token);
}

function isAuthHandshakePending({hasReceivedAuthRequest, hasRespondedToAuth}) {
  return !hasRespondedToAuth && hasReceivedAuthRequest;
}

function isSocketReady(socket) {
  return Boolean(socket && socket.readyState === WebSocket.OPEN);
}
