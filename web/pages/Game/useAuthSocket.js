import React from 'react';

import useConnectSocket from './useConnectSocket.js';


export const PLAYER_TOKEN_STORAGE_KEY = 'mt-player-token';

export default function useAuthSocket({isCharacterSelectScreen, setScreen}) {
  const hasReceivedAuthRequest = React.useRef(false);
  const hasRespondedToAuth = React.useRef(false);
  const hasSelectedFighter = React.useRef(false);
  const selectedRace = React.useRef(null);
  const refs = {hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, isCharacterSelectScreen, selectedRace, setScreen};
  const socketRef = useConnectSocket(({message, socket}) => onAuthMessage({...refs, message, socket}));
  return (race) => {
    selectedRace.current = race;
    hasSelectedFighter.current = true;
    respondToAuth({...refs, socket: socketRef.current});
    routeToHubIfAuthorized({hasSelectedFighter, setScreen});
  };
}

function onAuthMessage(authState) {
  if(onInvalidTokenMessage(authState)) {
    return;
  }
  if(authState.message?.type !== 'auth') {
    return;
  }
  onAuthRequest(authState);
}
function onAuthRequest(authState) {
  const {hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, isCharacterSelectScreen, message, selectedRace, setScreen, socket} = authState;
  if(message.token) {
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, message.token);
    routeToHubIfAuthorized({hasSelectedFighter, isCharacterSelectScreen, setScreen});
  }
  hasReceivedAuthRequest.current = true;
  respondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, selectedRace, socket});
}
function onInvalidTokenMessage(authState) {
  const {hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, message, selectedRace, socket} = authState;
  if(message?.type !== 'auth-invalid-token') {
    return false;
  }
  clearPlayerToken();
  hasRespondedToAuth.current = false;
  respondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, selectedRace, socket});
  return true;
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
  if(hasRespondedToAuth.current) {
    return false;
  }
  if(!hasReceivedAuthRequest.current) {
    return false;
  }
  if(!canRespondWithSelectedFighter(hasSelectedFighter)) {
    return false;
  }
  if(!socket) {
    return false;
  }
  return socket.readyState === WebSocket.OPEN;
}
function canRespondWithSelectedFighter(hasSelectedFighter) {
  if(hasSelectedFighter.current) {
    return true;
  }
  return Boolean(getPlayerToken());
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
function routeToHubIfAuthorized({hasSelectedFighter, isCharacterSelectScreen, setScreen}) {
  if(!getPlayerToken()) {
    return;
  }
  if(!hasSelectedFighter.current && !isCharacterSelectScreen) {
    return;
  }
  setScreen('hub');
}
