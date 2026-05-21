import useFighterActionsStore from '@/data/fighterActions.js';
import useFighterStore from '@/data/fighter.js';
import usePlayerStore from '@/data/player.js';
import router from '@/router.js';
import {canRespondToAuth, getAuthResponse, isSocketReady, parseSocketMessage} from '@/actions/websockets/websocketState.js';
import {clearPlayerToken, getPlayerToken, loadPlayerToken, setPlayerToken} from '@/actions/websockets/token.js';
let hasReceivedAuthRequest = false;
let hasRespondedToAuth = false;
let socket = null;
const onSocketCommand = {'auth': onAuth, 'auth-invalid-token': onAuthInvalidToken, 'ok': onOk, 'player_state': onPlayerState};

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

function onAuth(message) {
  if(message.display_name) {
    usePlayerStore.getState().setPlayerName(message.display_name);
  }
  if(Number.isInteger(message.player_id)) {
    usePlayerStore.getState().setPlayerID(message.player_id);
  }
  if(message.token) {
    setPlayerToken(message.token);
    routeToHubIfAuthorized();
  }
  hasReceivedAuthRequest = true;
  respondToAuth();
}

function onAuthInvalidToken() {
  clearPlayerToken();
  hasRespondedToAuth = false;
  respondToAuth();
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

function onOk(message) {
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

function respondToAuth() {
  const {selectedRace} = usePlayerStore.getState();
  const token = getPlayerToken();
  if(!canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, selectedRace, socket, token})) {
    return;
  }
  hasRespondedToAuth = true;
  socket.send(JSON.stringify(getAuthResponse({selectedRace, token})));
}

function routeToHubIfAuthorized() {
  const {selectedRace} = usePlayerStore.getState();
  const token = getPlayerToken();
  if(!selectedRace || !token) {
    return;
  }
  router.navigate('/hub');
}
