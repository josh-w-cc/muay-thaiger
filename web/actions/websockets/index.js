import useFighterStore from '@/data/fighter.js';
import usePlayerStore from '@/data/player.js';
import {onAuth, onAuthInvalidToken, resetAuthState, respondToAuth, routeToHubIfAuthorized} from '@/actions/websockets/auth.js';
import {isSocketReady, parseSocketMessage} from '@/actions/websockets/websocketState.js';
import {loadPlayerToken} from '@/actions/websockets/token.js';

let socket = null;
const onSocketCommand = {'auth': onAuthCommand, 'auth-invalid-token': onAuthInvalidTokenCommand, 'ok': () => {}, 'player_state': onPlayerState};

export const connectSocketOnAppLoad = connectSocket;
export function resetSocketState() {
  socket?.close?.();
  resetAuthState();
  socket = null;
}

export function createFighterActionCmd(actionID) {
  if(!Number.isInteger(actionID) || !isSocketReady(socket)) {
    return;
  }
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
  return socket;
}

function createWebSocketURL() {
  const url = new URL('/ws/connect', window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

function onAuthCommand(message) {
  onAuth({message, socket});
}

function onAuthInvalidTokenCommand() {
  onAuthInvalidToken(socket);
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
  const onCommand = onSocketCommand[message.cmd];
  if(!onCommand) {
    console.warn('Unknown websocket cmd:', message.cmd);
    return;
  }
  onCommand(message);
}
