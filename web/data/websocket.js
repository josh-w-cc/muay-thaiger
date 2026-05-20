import router from '@/router.js';
import {clearStoredPlayerToken} from './playerTokenStorage.js';

export function selectFighterCmd({get, set, socket}) {
  respondToAuth({get, set, socket});
  routeToHubIfAuthorized({get});
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

function canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, socket}) {
  return Boolean(
    !hasRespondedToAuth
    && hasReceivedAuthRequest
    && socket
    && socket.readyState === WebSocket.OPEN,
  );
}

function getAuthResponse({selectedRace, token}) {
  if(token) {
    return {cmd: 'auth', token};
  }
  if(!selectedRace) {
    return null;
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
  const {hasReceivedAuthRequest, hasRespondedToAuth, selectedRace, token} = get();
  if(!canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, socket})) {
    return;
  }
  const authResponse = getAuthResponse({selectedRace, token});
  if(!authResponse) {
    return;
  }
  set({hasRespondedToAuth: true});
  socket.send(JSON.stringify(authResponse));
}

function routeToHubIfAuthorized({get}) {
  const {token} = get();
  if(!token) {
    return;
  }
  router.navigate('/hub');
}
