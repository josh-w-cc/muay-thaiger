export const PLAYER_TOKEN_STORAGE_KEY = 'mt-player-token';

export function clearStoredPlayerToken() {
  if(typeof localStorage !== 'undefined') {
    localStorage.removeItem(PLAYER_TOKEN_STORAGE_KEY);
  }
}

export function getStoredPlayerToken() {
  return typeof localStorage === 'undefined' ? null : localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY);
}

export function setStoredPlayerToken(token) {
  if(typeof localStorage !== 'undefined') {
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, token);
  }
}
