import React from 'react';


export default function useConnectSocket(onMessage) {
  const socketRef = React.useRef(null);

  React.useEffect(() => connectSocket({onMessage, socketRef}), [onMessage]);

  return socketRef;
}

function connectSocket({onMessage, socketRef}) {
  const socket = new WebSocket(createWebSocketURL());
  socketRef.current = socket;
  socket.onmessage = (event) => onSocketMessage({event, onMessage, socket});
  return () => socket.close();
}

function createWebSocketURL() {
  const url = new URL('/ws/connect', window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

function onSocketMessage({event, onMessage, socket}) {
  const message = parseMessage(event);
  if(!message) {
    return;
  }
  onMessage({message, socket});
}

function parseMessage(event) {
  try {
    return JSON.parse(event.data);
  }
  catch{
    return null;
  }
}
