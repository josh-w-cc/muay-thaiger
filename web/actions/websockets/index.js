import {
  resetAuthState,
} from '@/actions/websockets/auth.js';
import {
  createFighterActionCmd as onCreateFighterActionCmd,
  removeFighterActionCmd as onRemoveFighterActionCmd,
  selectFighterCmd as onSelectFighterCmd,
} from '@/actions/websockets/clientCommands.js';
import {generateOnSocketMessageFn} from '@/actions/websockets/serverCommands.js';
import {loadPlayerToken} from '@/actions/websockets/token.js';
import {isSocketReady} from '@/actions/websockets/websocketState.js';
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
  onCreateFighterActionCmd(getOpenSocket(), actionID);
}

export function removeFighterActionCmd(actionID) {
  onRemoveFighterActionCmd(getOpenSocket(), actionID);
}

export function selectFighterCmd() {
  onSelectFighterCmd(getOpenSocket());
}

function connectSocket() {
  if(isSocketReady(socket)) {
    return socket;
  }
  if(socket) {
    resetSocketState();
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

function getOpenSocket() {
  if(isSocketReady(socket)) {
    return socket;
  }
  return connectSocket();
}
