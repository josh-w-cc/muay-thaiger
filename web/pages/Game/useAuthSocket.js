import React from 'react';

import useConnectSocket from './useConnectSocket.js';


export const PLAYER_TOKEN_STORAGE_KEY = 'mt-player-token';

export default function useAuthSocket(setScreen) {
  const hasReceivedAuthRequest = React.useRef(false);
  const hasRespondedToAuth = React.useRef(false);
  const hasSelectedFighter = React.useRef(false);
  const selectedRace = React.useRef(null);
  const refs = {hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, selectedRace, setScreen};
  const socketRef = useConnectSocket(({message, socket}) => onAuthMessage({...refs, message, socket}));
  return (race) => {
    selectedRace.current = race;
    hasSelectedFighter.current = true;
    respondToAuth({...refs, socket: socketRef.current});
    routeToHubIfAuthorized({hasSelectedFighter, setScreen});
  };
}

function onAuthMessage({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, message, selectedRace, setScreen, socket}) {
  const messageType = message.type;
  if(messageType === 'auth-invalid-token') {
    clearPlayerToken();
    hasRespondedToAuth.current = false;
    respondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, selectedRace, socket});
    return;
  }
  if(messageType !== 'auth') {
    return;
  }
  if(message.token) {
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, message.token);
    routeToHubIfAuthorized({hasSelectedFighter, setScreen});
  }
  hasReceivedAuthRequest.current = true;
  respondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, selectedRace, socket});
}
function respondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, selectedRace, socket, socketRef}) {
  const activeSocket = socket || socketRef?.current;
  if(!canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socket: activeSocket})) {
    return;
  }
  hasRespondedToAuth.current = true;
  activeSocket.send(JSON.stringify(getAuthResponse(selectedRace.current)));
}
function canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socket}) {
  return Boolean(
    !hasRespondedToAuth.current
    && hasReceivedAuthRequest.current
    && hasSelectedFighter.current
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
function getPlayerToken() {
  if(typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY);
}
function getAuthResponse(selectedRace) {
  const token = getPlayerToken();
  return token ? {token, type: 'auth'} : {race: selectedRace, token: 'new', type: 'auth'};
}
function routeToHubIfAuthorized({hasSelectedFighter, setScreen}) {
  if(!hasSelectedFighter.current || !getPlayerToken()) {
    return;
  }
  setScreen('hub');
}
