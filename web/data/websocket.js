import router from '@/router.js';
import {clearStoredPlayerToken} from './playerTokenStorage.js';

export function generateOnFighterSelectFn({get, set}) {
  return ({race, socket}) => {
    set({hasSelectedFighter: true, selectedRace: race});
    respondToAuth({get, set, socket});
    routeToHubIfAuthorized({get});
  };
}

export function generateOnSocketMessageFn({get, set}) {
  return ({message, socket}) => {
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
    onAuth({get, message, set, socket});
  };
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

function getAuthResponse({selectedRace, token}) {
  if(token) {
    return {cmd: 'auth', token};
  }
  return {cmd: 'auth', race: selectedRace, token: 'new'};
}

function onAuth({get, message, set, socket}) {
  if(message.token) {
    get().setToken(message.token);
    routeToHubIfAuthorized({get});
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

function routeToHubIfAuthorized({get}) {
  const {hasSelectedFighter, token} = get();
  if(!hasSelectedFighter || !token) {
    return;
  }
  router.navigate('/hub');
}
