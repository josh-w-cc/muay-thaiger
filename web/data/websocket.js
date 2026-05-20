import useFighterStore from '@/data/fighter.js';
import usePlayerStore from '@/data/player.js';
import router from '@/router.js';
import {canRespondToAuth, getAuthResponse, parseSocketMessage} from './websocketState.js';


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
  const message = parseSocketMessage(event);
  if(!message) {
    return;
  }
  if(message.cmd === 'auth') {
    onAuth(message);
    return;
  }
  if(message.cmd === 'auth-invalid-token') {
    onAuthInvalidToken();
    return;
  }
  if(message.cmd === 'player_state') {
    onPlayerState(message);
    return;
  }
  console.warn('Unknown websocket cmd:', message.cmd);
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

function isSocketReady() {
  return Boolean(socket && socket.readyState === WebSocket.OPEN);
}
