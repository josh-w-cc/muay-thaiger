import ReconnectingWebSocket from 'reconnecting-websocket';

import useFighterStore from '@/data/fighter.js';
import usePlayerStore from '@/data/player.js';
import router from '@/router.js';
import {canRespondToAuth, getAuthResponse, isSocketReady, parseSocketMessage} from '@/actions/websockets/websocketState.js';

let hasReceivedAuthRequest = false;
let hasRespondedToAuth = false;
let socket = null;
const onSocketCommand = {
  'auth': onAuth,
  'auth-invalid-token': onAuthInvalidToken,
  'player_state': onPlayerState,
};

export const connectSocketOnAppLoad = connectSocket;
export function resetSocketState() {
  socket?.close?.();
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
  socket = new ReconnectingWebSocket(createWebSocketURL(), [], {WebSocket});
  socket.onmessage = onSocketMessage;
  return socket;
}

function createWebSocketURL() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/connect`;
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
  if(!runSocketCommand(message)) {
    console.warn('Unknown websocket cmd:', message.cmd);
  }
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

function runSocketCommand(message) {
  const onCommand = onSocketCommand[message.cmd];
  if(!onCommand) {
    return message.cmd === 'ok';
  }
  onCommand(message);
  return true;
}
