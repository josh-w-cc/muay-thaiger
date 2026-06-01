import usePlayerStore from '@/data/player.js';

export const PLAYER_TOKEN_STORAGE_KEY = 'mt-player-token';
let playerToken = null;
let _router = null;

export function initRouter(router) {
  _router = router;
}

let hasReceivedAuthRequest = false;
let hasRespondedToAuth = false;

export function onAuth({message, socket}) {
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
  respondToAuth(socket);
}

export function onAuthInvalidToken() {
  clearPlayerToken();
  window.location.href = '/';
}

export function resetAuthState() {
  hasReceivedAuthRequest = false;
  hasRespondedToAuth = false;
}

export function respondToAuth(socket) {
  const {selectedRace} = usePlayerStore.getState();
  const token = getPlayerToken();
  if(!canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, selectedRace, socket, token})) {
    return;
  }
  hasRespondedToAuth = true;
  socket.send(JSON.stringify(getAuthResponse({selectedRace, token})));
}

export function routeToHubIfAuthorized() {
  const {selectedRace} = usePlayerStore.getState();
  const token = getPlayerToken();
  if(!selectedRace || !token) {
    return;
  }
  _router?.navigate('/hub');
}

export function canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, selectedRace, socket, token}) {
  return isAuthHandshakePending({hasReceivedAuthRequest, hasRespondedToAuth}) && hasAuthResponseData({selectedRace, token}) && isSocketReady(socket);
}

export function getAuthResponse({selectedRace, token}) {
  if(token) {
    return {cmd: 'auth', token};
  }
  return {cmd: 'auth', race: selectedRace, token: 'new'};
}

export function isSocketReady(socket) {
  return Boolean(socket && socket.readyState === WebSocket.OPEN);
}

function hasAuthResponseData({selectedRace, token}) {
  return Boolean(selectedRace || token);
}

function isAuthHandshakePending({hasReceivedAuthRequest, hasRespondedToAuth}) {
  return !hasRespondedToAuth && hasReceivedAuthRequest;
}

export function clearPlayerToken() {
  clearStoredPlayerToken();
  playerToken = null;
}

export function getPlayerToken() {
  return playerToken;
}

export function loadPlayerToken() {
  playerToken = getStoredPlayerToken();
  return playerToken;
}

export function setPlayerToken(token) {
  setStoredPlayerToken(token);
  playerToken = token;
}

function clearStoredPlayerToken() {
  if(typeof localStorage !== 'undefined') {
    localStorage.removeItem(PLAYER_TOKEN_STORAGE_KEY);
  }
}

function getStoredPlayerToken() {
  return typeof localStorage === 'undefined' ? null : localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY);
}

function setStoredPlayerToken(token) {
  if(typeof localStorage !== 'undefined') {
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, token);
  }
}
