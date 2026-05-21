import useFighterStore from '@/data/fighter.js';
import usePlayerStore from '@/data/player.js';
import router from '@/router.js';
import {canRespondToAuth, getAuthResponse, isSocketReady, parseSocketMessage} from '@/actions/websockets/websocketState.js';


let hasReceivedAuthRequest = false;
let hasRespondedToAuth = false;
let reconnectSocketTimeout = null;
let socket = null;
const SOCKET_INACTIVITY_MILLISECONDS = 15 * 60 * 1000;
const onSocketCommand = {
  'auth': onAuth,
  'auth-invalid-token': onAuthInvalidToken,
  'ok': () => {},
  'player_state': onPlayerState,
};

export const connectSocketOnAppLoad = connectSocket;
export function resetSocketState() {
  socket?.close?.();
  clearReconnectSocketTimeout();
  hasReceivedAuthRequest = false;
  hasRespondedToAuth = false;
  socket = null;
}

export function createFighterActionCmd(actionID) {
  if(!Number.isInteger(actionID) || !isSocketReady(socket)) {
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
  scheduleSocketReconnectTimeout();
  return socket;
}

function createWebSocketURL() {
  const url = new URL('/ws/connect', window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

function onAuth(message) {
  if(message.display_name) {
    usePlayerStore.getState().setPlayerName(message.display_name);
  }
  if(Number.isInteger(message.player_id)) {
    usePlayerStore.getState().setPlayerID(message.player_id);
  }
  if(message.token) {
    usePlayerStore.getState().setToken(message.token);
    routeToHubIfAuthorized();
  }
  hasReceivedAuthRequest = true;
  respondToAuth();
}

function onAuthInvalidToken() {
  usePlayerStore.getState().clearToken();
  hasRespondedToAuth = false;
  respondToAuth();
}

function onPlayerState(message) {
  if(!message.fighter) {
    return;
  }
  useFighterStore.getState().overwrite(message.fighter);
  usePlayerStore.getState().setPlayerID(message.fighter.player_id ?? null);
  usePlayerStore.getState().selectFighter(`${message.fighter.race}`);
  routeToHubIfAuthorized();
}

function onSocketMessage(event) {
  scheduleSocketReconnectTimeout();
  const message = parseSocketMessage(event);
  if(!message) {
    return;
  }
  const onCommand = onSocketCommand[message.cmd];
  if(!onCommand) {
    console.warn('Unknown websocket cmd:', message.cmd);
    return;
  }
  onCommand(message);
}

function clearReconnectSocketTimeout() {
  clearTimeout(reconnectSocketTimeout);
  reconnectSocketTimeout = null;
}

function reconnectSocket() {
  resetSocketState();
  connectSocket();
}

function respondToAuth() {
  const {selectedRace, token} = usePlayerStore.getState();
  if(!canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, selectedRace, socket, token})) {
    return;
  }
  hasRespondedToAuth = true;
  socket.send(JSON.stringify(getAuthResponse({selectedRace, token})));
}

function routeToHubIfAuthorized() {
  const {selectedRace, token} = usePlayerStore.getState();
  if(!selectedRace || !token) {
    return;
  }
  router.navigate('/hub');
}

function scheduleSocketReconnectTimeout() {
  clearReconnectSocketTimeout();
  reconnectSocketTimeout = setTimeout(reconnectSocket, SOCKET_INACTIVITY_MILLISECONDS);
}
