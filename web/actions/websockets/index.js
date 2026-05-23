import {
  resetAuthState,
} from '@/actions/websockets/auth.js';
import {
  createFighterActionCmd as onCreateFighterActionCmd,
  selectFighterCmd as onSelectFighterCmd,
} from '@/actions/websockets/clientCommands.js';
import {generateOnSocketMessageFn} from '@/actions/websockets/serverCommands.js';
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
  onCreateFighterActionCmd(socket, actionID);
}

export function selectFighterCmd() {
  onSelectFighterCmd(socket);
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
