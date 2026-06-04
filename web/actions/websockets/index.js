import {
  resetAuthState,
} from '@/actions/websockets/auth.js';
import {generateOnSocketMessageFn} from '@/actions/websockets/serverCommands.js';
import {loadPlayerToken} from '@/actions/websockets/state/token.js';
import {isSocketReady} from '@/actions/websockets/state/websocketState.js';
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
  console.debug('WebSocket send cmd:', command.cmd);
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
  const socketURL = createWebSocketURL();
  socket = new WebSocket(socketURL);
  console.info('WebSocket connecting:', socketURL);
  socket.onopen = () => console.info('WebSocket open');
  socket.onclose = () => console.info('WebSocket closed');
  socket.onerror = (event) => console.error('WebSocket error:', event);
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
    console.info('WebSocket reconnecting after inactivity');
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
