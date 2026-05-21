import {clearStoredPlayerToken, getStoredPlayerToken, setStoredPlayerToken} from '@/data/playerTokenStorage.js';
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
