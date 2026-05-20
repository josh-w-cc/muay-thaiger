import {create} from 'zustand';
import {clearStoredPlayerToken, getStoredPlayerToken, setStoredPlayerToken} from './playerTokenStorage.js';

const usePlayerStore = create((set) => ({
  ...getInitialState(),
  loadToken: () => loadPlayerTokenIntoState(set),
  selectFighter: (race) => set({selectedRace: race}),
  setPlayerID: (playerID) => set({playerID}),
  setPlayerName: (playerName) => set({playerName}),
  setToken: (token) => {
    setStoredPlayerToken(token);
    set({token});
  },
  clearToken: () => {
    clearStoredPlayerToken();
    set({token: null});
  },
}));
export default usePlayerStore;


export const loadPlayerToken = () => usePlayerStore.getState().loadToken();
export const resetPlayerStore = () => {
  clearStoredPlayerToken();
  usePlayerStore.setState(getInitialState());
};
export const setPlayerToken = (token) => usePlayerStore.getState().setToken(token);

function getInitialState() {
  return {
    playerID: null,
    playerName: null,
    selectedRace: null,
    token: getStoredPlayerToken(),
  };
}

function loadPlayerTokenIntoState(set) {
  const token = getStoredPlayerToken();
  set({token});
  return token;
}
