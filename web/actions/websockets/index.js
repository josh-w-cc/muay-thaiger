import useFighterActionsStore from '@/data/fighterActions.js';
import useFighterStore from '@/data/fighter.js';
import useFightStore from '@/data/fight.js';
import usePlayerStore from '@/data/player.js';
import {
  isSocketReady,
  resetAuthState,
  onAuth as onAuthMessage,
  onAuthInvalidToken as onAuthInvalidTokenMessage,
} from '@/actions/websockets/auth.js';
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

function generateOnSocketMessage(socket, scheduleReconnectTimeout) {
  return function onSocketMessage(event) {
    scheduleReconnectTimeout();
    const message = parseSocketMessage(event);
    if(!message) {
      return;
    }
    const onCommand = onSocketCommand[message.cmd];
    if(!onCommand) {
      console.warn('Unknown websocket cmd:', message.cmd);
      return;
    }
    onCommand(message, socket);
  };
}

function onAuth(message, socket) {
  onAuthMessage({message, socket});
}

function onAuthInvalidToken() {
  onAuthInvalidTokenMessage();
}

function onPlayerState(message) {
  if(!message.fighter) {
    return;
  }
  useFighterActionsStore.getState().setActions(Array.isArray(message.actions) ? message.actions : []);
  useFightStore.getState().syncServerState(message.fight || null);
  useFighterStore.getState().overwrite(message.fighter);
  usePlayerStore.getState().setPlayerID(message.fighter.player ?? null);
  usePlayerStore.getState().selectFighter(`${message.fighter.race}`);
}

function parseSocketMessage(event) {
  try {
    return JSON.parse(event.data);
  }
  catch {
    return null;
  }
}
