import {create} from 'zustand';
import {generateOnSocketMessageFn} from './websocket.js';
import {clearStoredPlayerToken, getStoredPlayerToken, setStoredPlayerToken} from './playerTokenStorage.js';

const usePlayerStore = create((set, get) => ({
  ...getInitialState(),
  loadToken: () => loadPlayerTokenIntoState(set),
  onSocketMessage: generateOnSocketMessageFn({get, set}),
  setToken: (token) => {
    setStoredPlayerToken(token);
    set({token});
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
    hasReceivedAuthRequest: false,
    hasRespondedToAuth: false,
    hasSelectedFighter: false,
    selectedRace: null,
    token: getStoredPlayerToken(),
  };
}

function loadPlayerTokenIntoState(set) {
  const token = getStoredPlayerToken();
  set({token});
  return token;
}
