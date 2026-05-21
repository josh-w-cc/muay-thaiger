export const PLAYER_TOKEN_STORAGE_KEY = 'mt-player-token';
let playerToken = null;


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
