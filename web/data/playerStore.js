import {create} from 'zustand';


export const PLAYER_TOKEN_STORAGE_KEY = 'mt-player-token';


const usePlayerStore = create((set, get) => ({
  ...getInitialState(),
  onFighterSelect: generateFighterSelectFn({get, set}),
  onSocketMessage: generateSocketMessageFn({get, set}),
}));

export default usePlayerStore;


export function resetPlayerStore() {
  usePlayerStore.setState(getInitialState());
}


function canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socket}) {
  return Boolean(
    !hasRespondedToAuth
    && hasReceivedAuthRequest
    && hasSelectedFighter
    && socket
    && socket.readyState === WebSocket.OPEN,
  );
}

function clearPlayerToken() {
  if(typeof localStorage === 'undefined') {
    return;
  }
  localStorage.removeItem(PLAYER_TOKEN_STORAGE_KEY);
}

function generateFighterSelectFn({get, set}) {
  return ({race, setScreen, socket}) => {
    set({hasSelectedFighter: true, selectedRace: race});
    respondToAuth({get, set, socket});
    routeToHubIfAuthorized({get, setScreen});
  };
}

function generateSocketMessageFn({get, set}) {
  return ({message, setScreen, socket}) => {
    const messageType = message?.type;
    if(messageType === 'auth-invalid-token') {
      clearPlayerToken();
      set({hasRespondedToAuth: false});
      respondToAuth({get, set, socket});
      return;
    }
    if(messageType !== 'auth') {
      return;
    }
    onAuth({get, message, set, setScreen, socket});
  };
}

function getAuthResponse(selectedRace) {
  const token = getPlayerToken();
  return token ? {cmd: 'auth', token} : {cmd: 'auth', race: selectedRace, token: 'new'};
}

function getInitialState() {
  return {
    hasReceivedAuthRequest: false,
    hasRespondedToAuth: false,
    hasSelectedFighter: false,
    selectedRace: null,
  };
}

function getPlayerToken() {
  if(typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY);
}

function onAuth({get, message, set, setScreen, socket}) {
  if(message.token) {
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, message.token);
    routeToHubIfAuthorized({get, setScreen});
  }
  set({hasReceivedAuthRequest: true});
  respondToAuth({get, set, socket});
}

function respondToAuth({get, set, socket}) {
  const {hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, selectedRace} = get();
  if(!canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socket})) {
    return;
  }
  set({hasRespondedToAuth: true});
  socket.send(JSON.stringify(getAuthResponse(selectedRace)));
}

function routeToHubIfAuthorized({get, setScreen}) {
  const {hasSelectedFighter} = get();
  if(!hasSelectedFighter || !getPlayerToken()) {
    return;
  }
  setScreen('hub');
}
