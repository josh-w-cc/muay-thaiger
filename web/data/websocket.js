import usePlayerStore from '@/data/player.js';
import router from '@/router.js';

let hasReceivedAuthRequest = false;
let hasRespondedToAuth = false;
let socket = null;

export const connectSocketOnAppLoad = connectSocket;
export function resetSocketState() {
  if(socket?.close) {
    socket.close();
  }
  hasReceivedAuthRequest = false;
  hasRespondedToAuth = false;
  socket = null;
}

export function createFighterActionCmd(actionID) {
  if(!Number.isInteger(actionID) || !isSocketReady()) {
    return;
  }
  socket.send(JSON.stringify({action_id: actionID, cmd: 'idle'}));
}

export function selectFighterCmd() {
  respondToAuth();
  routeToHubIfAuthorized();
}
function connectSocket() {
  if(socket) {
    return socket;
  }
  socket = new WebSocket(createWebSocketURL());
  socket.onmessage = onSocketMessage;
  return socket;
}

function createWebSocketURL() {
  const url = new URL('/ws/connect', window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

function onAuth(message) {
  if(message.token) {
    usePlayerStore.getState().setToken(message.token);
    routeToHubIfAuthorized();
  }
  hasReceivedAuthRequest = true;
  respondToAuth();
}

function onSocketMessage(event) {
  const message = parseMessage(event);
  if(!message) {
    return;
  }
  const {cmd} = message;
  switch(cmd) {
    case 'auth':
      onAuth(message);
      return;
    case 'auth-invalid-token':
      usePlayerStore.getState().clearToken();
      hasRespondedToAuth = false;
      respondToAuth();
      return;
    default:
      console.warn('Unknown websocket cmd:', cmd);
  }
}

function parseMessage(event) {
  try {
    return JSON.parse(event.data);
  }
  catch {
    return null;
  }
}

function respondToAuth() {
  if(!canRespondToAuth()) {
    return;
  }
  hasRespondedToAuth = true;
  socket.send(JSON.stringify(getAuthResponse()));
}

function routeToHubIfAuthorized() {
  const {selectedRace, token} = usePlayerStore.getState();
  if(!selectedRace || !token) {
    return;
  }
  router.navigate('/hub');
}

function getAuthResponse() {
  const {selectedRace, token} = usePlayerStore.getState();
  if(token) {
    return {cmd: 'auth', token};
  }
  return {cmd: 'auth', race: selectedRace, token: 'new'};
}

function canRespondToAuth() {
  return isAuthHandshakePending() && hasAuthResponseData() && isSocketReady();
}

function isAuthHandshakePending() {
  return !hasRespondedToAuth && hasReceivedAuthRequest;
}

function hasAuthResponseData() {
  const {selectedRace, token} = usePlayerStore.getState();
  return Boolean(selectedRace || token);
}

function isSocketReady() {
  return Boolean(socket && socket.readyState === WebSocket.OPEN);
}
