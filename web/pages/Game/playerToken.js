export const PLAYER_TOKEN_STORAGE_KEY = 'mt-player-token';

export function getPlayerToken() {
  if(typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY);
}
