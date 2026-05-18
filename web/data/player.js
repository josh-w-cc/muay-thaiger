import {create} from 'zustand';
import {clearStoredPlayerToken, getStoredPlayerToken, setStoredPlayerToken} from './playerTokenStorage.js';

const usePlayerStore = create((set, get) => ({
  ...getInitialState(),
  loadToken: () => loadPlayerTokenIntoState(set),
  onFighterSelect: generateOnFighterSelectFn({get, set}),
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

function canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socket}) {
  return Boolean(
    !hasRespondedToAuth
    && hasReceivedAuthRequest
    && hasSelectedFighter
    && socket
    && socket.readyState === WebSocket.OPEN,
  );
}

function generateOnFighterSelectFn({get, set}) {
  return ({race, setScreen, socket}) => {
    set({hasSelectedFighter: true, selectedRace: race});
    respondToAuth({get, set, socket});
    routeToHubIfAuthorized({get, setScreen});
  };
}

function generateOnSocketMessageFn({get, set}) {
  return ({message, setScreen, socket}) => {
    const messageType = message?.type;
    if(messageType === 'auth-invalid-token') {
      clearStoredPlayerToken();
      set({hasRespondedToAuth: false, token: null});
      respondToAuth({get, set, socket});
      return;
    }
    if(messageType !== 'auth') {
      return;
    }
    onAuth({get, message, set, setScreen, socket});
  };
}

function getAuthResponse({token, selectedRace}) {
  if(token) {
    return {cmd: 'auth', token};
  }
  return {cmd: 'auth', race: selectedRace, token: 'new'};
}

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

function onAuth({get, message, set, setScreen, socket}) {
  if(message.token) {
    get().setToken(message.token);
    routeToHubIfAuthorized({get, setScreen});
  }
  set({hasReceivedAuthRequest: true});
  respondToAuth({get, set, socket});
}

function respondToAuth({get, set, socket}) {
  const {hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, selectedRace, token} = get();
  if(!canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socket})) {
    return;
  }
  set({hasRespondedToAuth: true});
  socket.send(JSON.stringify(getAuthResponse({selectedRace, token})));
}

function routeToHubIfAuthorized({get, setScreen}) {
  const {hasSelectedFighter, token} = get();
  if(!hasSelectedFighter || !token) {
    return;
  }
  setScreen('hub');
}
