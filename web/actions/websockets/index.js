import {
  initRouter,
  isSocketReady,
  loadPlayerToken,
  resetAuthState,
} from '@/actions/websockets/auth.js';
import {generateOnSocketMessage} from '@/actions/websockets/serverCommands.js';
import router from '@/router.js';

initRouter(router);

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

export function sendCommand(command) {
  const openSocket = getOpenSocket();
  if(!isSocketReady(openSocket)) {
    return;
  }
  openSocket.send(JSON.stringify(command));
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
  socket.onmessage = generateOnSocketMessage(socket, scheduleSocketReconnectTimeout);
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
