import React from 'react';


export default function useAuthSocket(setScreen) {
  const hasReceivedAuthRequest = React.useRef(false);
  const hasRespondedToAuth = React.useRef(false);
  const hasSelectedFighter = React.useRef(false);
  const socketRef = React.useRef(null);
  const refs = {hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socketRef};

  React.useEffect(() => connectSocket(refs), []);

  return () => {
    hasSelectedFighter.current = true;
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

function getMessageType(event) {
  try {
    return JSON.parse(event.data).type;
  }
  catch{
    return null;
  }
}

function onMessage({event, hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socket}) {
  if(getMessageType(event) !== 'auth') {
    return;
  }
  hasReceivedAuthRequest.current = true;
  respondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socket});
}

function respondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socket, socketRef}) {
  const activeSocket = socket || socketRef?.current;
  if(!canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, hasSelectedFighter, socket: activeSocket})) {
    return;
  }
  hasRespondedToAuth.current = true;
  activeSocket.send(JSON.stringify({token: 'new', type: 'auth'}));
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
