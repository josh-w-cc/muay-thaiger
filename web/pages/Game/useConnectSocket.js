import React from 'react';


export default function useConnectSocket(onMessage) {
  const onMessageRef = React.useRef(onMessage);
  const socketRef = React.useRef(null);

  React.useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  React.useEffect(() => connectSocket({onMessageRef, socketRef}), []);

  return socketRef;
}

function connectSocket({onMessageRef, socketRef}) {
  const socket = new WebSocket(createWebSocketURL());
  socketRef.current = socket;
  socket.onmessage = (event) => onSocketMessage({event, onMessageRef, socket});
  return () => socket.close();
}

function createWebSocketURL() {
  const url = new URL('/ws/connect', window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

function onSocketMessage({event, onMessageRef, socket}) {
  const message = parseMessage(event);
  if(!message) {
    return;
  }
  onMessageRef.current({message, socket});
}

function parseMessage(event) {
  try {
    return JSON.parse(event.data);
  }
  catch{
    return null;
  }
}
