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
let socket = null;
const onSocketCommand = {'auth': onAuth, 'auth-invalid-token': onAuthInvalidToken, 'ok': onIdleOk, 'player_state': onPlayerState};

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
  const url = new URL('/ws/connect', window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  socket = new WebSocket(url.toString());
  socket.onmessage = onSocketMessage;
  return socket;
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

function onIdleOk(message) {
  if(message.metadata?.responded_cmd === 'idle' && message.metadata.fighterAction) {
    useFighterActionsStore.getState().addAction(message.metadata.fighterAction);
  }
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
