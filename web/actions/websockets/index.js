import useFighterActionsStore from '@/data/fighterActions.js';
import {
  resetAuthState,
  respondToAuth,
  routeToHubIfAuthorized,
} from '@/actions/websockets/auth.js';
import {generateOnSocketMessageFn} from '@/actions/websockets/commands.js';
import {isSocketReady} from '@/actions/websockets/websocketState.js';
import {loadPlayerToken} from '@/actions/websockets/token.js';
let reconnectSocketTimeout = null;
let socket = null;
const SOCKET_INACTIVITY_MILLISECONDS = 15 * 60 * 1000;

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
  socket.onmessage = generateOnSocketMessageFn(socket, scheduleSocketReconnectTimeout);
  scheduleSocketReconnectTimeout();
  return socket;
}

function createWebSocketURL() {
  const url = new URL('/ws/connect', window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

function scheduleSocketReconnectTimeout() {
  clearTimeout(reconnectSocketTimeout);
  reconnectSocketTimeout = setTimeout(() => {
    resetSocketState();
    connectSocket();
  }, SOCKET_INACTIVITY_MILLISECONDS);
}
