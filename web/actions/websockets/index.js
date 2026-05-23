import useFighterActionsStore from '@/data/fighterActions.js';
import useFighterStore from '@/data/fighter.js';
import usePlayerStore from '@/data/player.js';
import {
  onAuth as onAuthMessage,
  onAuthInvalidToken as onAuthInvalidTokenMessage,
  resetAuthState,
  respondToAuth,
  routeToHubIfAuthorized,
} from '@/actions/websockets/auth.js';
import {isSocketReady, parseSocketMessage} from '@/actions/websockets/websocketState.js';
import {loadPlayerToken} from '@/actions/websockets/token.js';
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
  clearTimeout(reconnectSocketTimeout);
  reconnectSocketTimeout = null;
  resetAuthState();
  socket = null;
}

export function createFighterActionCmd(actionID) {
  if(!Number.isInteger(actionID) || !isSocketReady(socket)) {
    return;
  }
  useFighterActionsStore.getState().addAction({action_id: actionID});
  socket.send(JSON.stringify({action_id: actionID, cmd: 'idle'}));
}

export function selectFighterCmd() {
  respondToAuth(socket);
  routeToHubIfAuthorized();
}

function connectSocket() {
  if(socket) {
    return socket;
  }
  loadPlayerToken();
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
  onAuthMessage({message, socket});
}

function onAuthInvalidToken() {
  onAuthInvalidTokenMessage(socket);
}

function onPlayerState(message) {
  if(!message.fighter) {
    return;
  }
  useFighterActionsStore.getState().setActions(Array.isArray(message.actions) ? message.actions : []);
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

function scheduleSocketReconnectTimeout() {
  clearTimeout(reconnectSocketTimeout);
  reconnectSocketTimeout = setTimeout(() => {
    resetSocketState();
    connectSocket();
  }, SOCKET_INACTIVITY_MILLISECONDS);
}
