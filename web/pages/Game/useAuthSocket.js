import React from 'react';

export const PLAYER_TOKEN_STORAGE_KEY = 'mt-player-token';


export default function useAuthSocket(setScreen) {
  const hasReceivedAuthRequest = React.useRef(false);
  const hasRespondedToAuth = React.useRef(false);
  const hasSelectedFighter = React.useRef(false);
  const selectedRace = React.useRef(null);
  const socketRef = React.useRef(null);
  const refs = {hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, selectedRace, socketRef};

  React.useEffect(() => connectSocket(refs), []);

  return (race) => {
    hasSelectedFighter.current = true;
    selectedRace.current = race;
    respondToAuth({...refs, socket: socketRef.current});
    setScreen('hub');
  };
}

function connectSocket({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socketRef}) {
  const socket = new WebSocket(createWebSocketURL());
  socketRef.current = socket;
  socket.onmessage = (event) => onMessage({event, hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socket});
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

function onMessage({event, hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socket}) {
  const message = getMessage(event);
  if(message?.type !== 'auth') {
    return;
  }
  if(message.token) {
    localStorage.setItem(PLAYER_TOKEN_STORAGE_KEY, message.token);
  }
  hasReceivedAuthRequest.current = true;
  respondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socket});
}

function respondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, selectedRace, socket, socketRef}) {
  const activeSocket = socket || socketRef?.current;
  if(!canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socket: activeSocket})) {
    return;
  }
  hasRespondedToAuth.current = true;
  activeSocket.send(JSON.stringify(getAuthRequest(selectedRace.current)));
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

function getAuthRequest(race) {
  return race
    ? {race, token: 'new', type: 'auth'}
    : {token: 'new', type: 'auth'};
}
