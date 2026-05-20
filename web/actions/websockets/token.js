import usePlayerStore from '@/data/player.js';
import {clearStoredPlayerToken, getStoredPlayerToken, setStoredPlayerToken} from '@/data/playerTokenStorage.js';


export function clearPlayerToken() {
  clearStoredPlayerToken();
  usePlayerStore.getState().clearToken();
}

export function loadPlayerToken() {
  const token = getStoredPlayerToken();
  usePlayerStore.getState().setToken(token);
  return token;
}

export function setPlayerToken(token) {
  setStoredPlayerToken(token);
  usePlayerStore.getState().setToken(token);
}
