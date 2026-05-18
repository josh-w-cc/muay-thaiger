import React from 'react';

export const PLAYER_TOKEN_STORAGE_KEY = 'mt-player-token';


export default function useAuthSocket(setScreen) {
  const hasReceivedAuthRequest = React.useRef(false);
  const hasRespondedToAuth = React.useRef(false);
  const hasSelectedFighter = React.useRef(false);
  const selectedRace = React.useRef(null);
  const socketRef = React.useRef(null);
  const refs = {hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, selectedRace, setScreen, socketRef};

  React.useEffect(() => connectSocket(refs), []);

  return (race) => {
    selectedRace.current = race;
    hasSelectedFighter.current = true;
    respondToAuth({...refs, socket: socketRef.current});
    routeToHubIfAuthorized({hasSelectedFighter, setScreen});
  };
}

function connectSocket({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, selectedRace, setScreen, socketRef}) {
  const socket = new WebSocket(createWebSocketURL());
  socketRef.current = socket;
  socket.onmessage = (event) => onMessage({
    event,
    hasReceivedAuthRequest,
    hasRespondedToAuth,
    hasSelectedFighter,
    selectedRace,
    setScreen,
    socket,
  });
  return () => socket.close();
}

function createWebSocketURL() {
  const url = new URL('/ws/connect', window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

function getMessage(event) {
  try {
    return JSON.parse(event.data);
  }
  catch{
    return null;
  }
}

function onMessage({event, hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, selectedRace, setScreen, socket}) {
  const message = getMessage(event);
  if(message?.type !== 'auth') {
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

function getPlayerToken() {
  if(typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY);
}

function getAuthResponse(selectedRace) {
  const token = getPlayerToken();
  if(token) {
    return {token, type: 'auth'};
  }
  return {race: selectedRace, token: 'new', type: 'auth'};
}

function routeToHubIfAuthorized({hasSelectedFighter, setScreen}) {
  if(!hasSelectedFighter.current || !getPlayerToken()) {
    return;
  }
  setScreen('hub');
}
